"""
Report Generation Service
Makes 4 parallel DeepSeek API calls to produce a rich Flowmingo-style candidate report.
"""
import os
import json
import asyncio
import logging
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)


class ReportGenerationService:
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.base_url = "https://api.deepseek.com"
        self.model = "deepseek-chat"

        api_key = os.environ.get('DEEPSEEK_API_KEY')
        if api_key:
            self.client = AsyncOpenAI(api_key=api_key, base_url=self.base_url)
            self.enabled = True
            logger.info("✅ ReportGenerationService enabled")
        else:
            self.client = None
            self.enabled = False
            logger.warning("⚠️ ReportGenerationService disabled – no DEEPSEEK_API_KEY")

    # ------------------------------------------------------------------ helpers
    async def _call_api(self, messages, max_tokens=4000, retry_count=0):
        from services.deepseek_rate_limiter import RateLimitedCall
        try:
            async with RateLimitedCall():
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7,
                    stream=False,
                )
            content = response.choices[0].message.content
            if not content or content.strip() == '':
                raise Exception("Empty API response")
            return content
        except Exception as e:
            error_msg = str(e)
            if ('rate' in error_msg.lower() or '429' in error_msg) and retry_count < 3:
                wait = (2 ** retry_count) * 2
                logger.warning(f"Rate limited – retrying in {wait}s (attempt {retry_count+1})")
                await asyncio.sleep(wait)
                return await self._call_api(messages, max_tokens, retry_count + 1)
            if 'timeout' in error_msg.lower() and retry_count == 0:
                await asyncio.sleep(2)
                return await self._call_api(messages, max_tokens, 1)
            raise

    def _parse_json(self, raw_text):
        """Extract and parse JSON from an API response that may include markdown fences."""
        text = raw_text.strip()
        if '```' in text:
            parts = text.split('```')
            for part in parts:
                p = part.strip()
                if p.startswith('json'):
                    p = p[4:].strip()
                if p.startswith('{'):
                    text = p
                    break
        # Find first { and last }
        start = text.find('{')
        end = text.rfind('}')
        if start == -1 or end == -1:
            raise ValueError(f"No JSON object found in response: {text[:200]}")
        return json.loads(text[start:end+1])

    @staticmethod
    def _clamp(val, lo, hi, default=0):
        try:
            v = float(val)
            return max(lo, min(v, hi))
        except (TypeError, ValueError):
            return default

    # ================================================================ CALL 1
    async def _call_interview_cv(self, job_desc, cv_text, qa_pairs, existing_scores):
        """Call 1 – Interview + CV combined analysis."""
        qa_block = "\n".join(
            f"Q{i+1}: {q}\nA{i+1}: {a}\nScores: R={s.get('relevance',0)} T={s.get('technical',0)} C={s.get('communication',0)} Conf={s.get('confidence',0)}"
            for i, (q, a, s) in enumerate(qa_pairs)
        )
        prompt = f"""You are an expert talent assessment AI. Analyze this candidate's interview and CV.

JOB DESCRIPTION:
{job_desc[:2000]}

CANDIDATE CV:
{cv_text[:3000]}

INTERVIEW Q&A WITH EXISTING SCORES:
{qa_block}

Return ONLY a JSON object (no markdown, no explanation) with this exact schema:
{{
  "overall_score": <float 0-10>,
  "summary": "<3-4 sentence holistic summary>",
  "recommendations": ["<rec1>", "<rec2>", "<rec3>"],
  "strengths": ["<str1>", "<str2>", "<str3>"],
  "gaps": ["<gap1>", "<gap2>", "<gap3>"],
  "rubrics": [
    {{"dimension": "<name>", "score": <float 0-10>, "explanation": "<detail>"}},
    {{"dimension": "<name>", "score": <float 0-10>, "explanation": "<detail>"}},
    {{"dimension": "<name>", "score": <float 0-10>, "explanation": "<detail>"}},
    {{"dimension": "<name>", "score": <float 0-10>, "explanation": "<detail>"}},
    {{"dimension": "<name>", "score": <float 0-10>, "explanation": "<detail>"}}
  ]
}}
Infer the 5 most relevant skill dimensions from the job description. Scores must reflect interview performance and CV strength."""

        messages = [
            {"role": "system", "content": "You are a rigorous talent assessment engine. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]
        raw = await self._call_api(messages, max_tokens=3000)
        data = self._parse_json(raw)

        # Validate / clamp
        data['overall_score'] = self._clamp(data.get('overall_score'), 0, 10)
        data['summary'] = str(data.get('summary', ''))[:1000]
        for key in ('recommendations', 'strengths', 'gaps'):
            items = data.get(key, [])
            data[key] = [str(x) for x in items][:3] if isinstance(items, list) else []
        rubrics = data.get('rubrics', [])
        cleaned_rubrics = []
        for r in (rubrics if isinstance(rubrics, list) else [])[:5]:
            cleaned_rubrics.append({
                'dimension': str(r.get('dimension', 'Skill')),
                'score': self._clamp(r.get('score'), 0, 10),
                'explanation': str(r.get('explanation', ''))[:500],
            })
        data['rubrics'] = cleaned_rubrics
        return data

    # ================================================================ CALL 2
    async def _call_transcript_analysis(self, transcript):
        """Call 2 – Communication skills + Cognitive insights from transcript."""
        prompt = f"""You are an expert psycholinguistic analyst. Analyze this interview transcript.

FULL INTERVIEW TRANSCRIPT:
{transcript[:6000]}

Return ONLY a JSON object with this exact schema:
{{
  "communication_skills": {{
    "grammar": <float 0-5>,
    "fluency": <float 0-5>,
    "comprehension": <float 0-5>,
    "vocabulary_sufficiency": <float 0-5>,
    "coherence": <float 0-5>
  }},
  "cognitive_insights": {{
    "logical_reasoning": <float 0-5>,
    "critical_thinking": <float 0-5>,
    "problem_solving": <float 0-5>,
    "big_picture_thinking": <float 0-5>,
    "insightfulness": <float 0-5>,
    "clarity": <float 0-5>,
    "decision_making": <float 0-5>,
    "intellectual_self_awareness": <float 0-5>
  }}
}}

For communication: analyze grammatical correctness, fluency/smoothness, understanding of questions, vocabulary range, and logical coherence.
For cognitive: infer from depth, structure, and quality of answers – not just what was said but how they reasoned."""

        messages = [
            {"role": "system", "content": "You are an expert psycholinguistic analyst. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]
        raw = await self._call_api(messages, max_tokens=1500)
        data = self._parse_json(raw)

        comm = data.get('communication_skills', {})
        for k in ('grammar', 'fluency', 'comprehension', 'vocabulary_sufficiency', 'coherence'):
            comm[k] = self._clamp(comm.get(k), 0, 5)
        data['communication_skills'] = comm

        cog = data.get('cognitive_insights', {})
        for k in ('logical_reasoning', 'critical_thinking', 'problem_solving',
                   'big_picture_thinking', 'insightfulness', 'clarity',
                   'decision_making', 'intellectual_self_awareness'):
            cog[k] = self._clamp(cog.get(k), 0, 5)
        data['cognitive_insights'] = cog
        return data

    # ================================================================ CALL 3
    async def _call_expression_analysis(self, expression_counts):
        """Call 3 – Vibe panel from expression label counts."""
        prompt = f"""You are an expert behavioral analyst. Based on these facial expression label counts recorded during a video interview, provide a summary.

EXPRESSION LABEL COUNTS:
{json.dumps(expression_counts)}

Return ONLY a JSON object:
{{
  "general_expression": "<e.g. Primarily Neutral / Positive / Anxious / Mixed>",
  "eye_contact": "<Frequent / Occasional / Rare>"
}}

Base your answer purely on the counts. If neutral count dominates say "Primarily Neutral"."""

        messages = [
            {"role": "system", "content": "You are a behavioral analyst. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]
        raw = await self._call_api(messages, max_tokens=500)
        data = self._parse_json(raw)
        data['general_expression'] = str(data.get('general_expression', 'Neutral'))
        data['eye_contact'] = str(data.get('eye_contact', 'Occasional'))
        return data

    # ================================================================ CALL 4
    async def _call_cv_analysis(self, cv_text):
        """Call 4 – CV-only deep analysis: profile radar, red flags, key attributes, doc professionalism."""
        prompt = f"""You are an expert CV analyst and career advisor. Analyze this candidate's CV thoroughly.

CANDIDATE CV:
{cv_text[:4000]}

Return ONLY a JSON object with this exact schema:
{{
  "cv_profile_radar": {{
    "strategic_focus": <float 0-5>,
    "learning_velocity": <float 0-5>,
    "career_progression": <float 0-5>,
    "drive_and_initiative": <float 0-5>,
    "intellectual_ability": <float 0-5>,
    "managerial_experience": <float 0-5>,
    "recognized_accomplishments": <float 0-5>,
    "original_and_creative_thinking": <float 0-5>
  }},
  "red_flags": {{
    "timeline_and_tenure": {{"flagged": <bool>, "detail": "<explanation>"}},
    "experience_and_representation": {{"flagged": <bool>, "detail": "<explanation>"}},
    "other": {{"flagged": <bool>, "detail": "<explanation>"}}
  }},
  "key_attributes": {{
    "experience_model": "<Hybrid / IC / Manager>",
    "leadership_potential": <float 0-5>,
    "entrepreneurial_spirit": <float 0-5>,
    "estimated_career_potential": <float 0-5>,
    "career_potential_explanation": "<one sentence>"
  }},
  "document_professionalism": {{
    "attention_to_detail": <float 0-5>,
    "clarity_and_completeness": <float 0-5>
  }}
}}

Infer from quantified achievements, promotions, side projects, certifications, breadth of skills. Be honest about red flags."""

        messages = [
            {"role": "system", "content": "You are an expert CV analyst. Return ONLY valid JSON."},
            {"role": "user", "content": prompt}
        ]
        raw = await self._call_api(messages, max_tokens=2500)
        data = self._parse_json(raw)

        # Validate cv_profile_radar
        radar = data.get('cv_profile_radar', {})
        for k in ('strategic_focus', 'learning_velocity', 'career_progression',
                   'drive_and_initiative', 'intellectual_ability', 'managerial_experience',
                   'recognized_accomplishments', 'original_and_creative_thinking'):
            radar[k] = self._clamp(radar.get(k), 0, 5)
        data['cv_profile_radar'] = radar

        # Validate red_flags
        flags = data.get('red_flags', {})
        for k in ('timeline_and_tenure', 'experience_and_representation', 'other'):
            f = flags.get(k, {})
            flags[k] = {
                'flagged': bool(f.get('flagged', False)),
                'detail': str(f.get('detail', 'No issues detected'))[:500]
            }
        data['red_flags'] = flags

        # Validate key_attributes
        attrs = data.get('key_attributes', {})
        attrs['experience_model'] = str(attrs.get('experience_model', 'IC'))
        attrs['leadership_potential'] = self._clamp(attrs.get('leadership_potential'), 0, 5)
        attrs['entrepreneurial_spirit'] = self._clamp(attrs.get('entrepreneurial_spirit'), 0, 5)
        attrs['estimated_career_potential'] = self._clamp(attrs.get('estimated_career_potential'), 0, 5)
        attrs['career_potential_explanation'] = str(attrs.get('career_potential_explanation', ''))[:300]
        data['key_attributes'] = attrs

        # Validate document_professionalism
        doc = data.get('document_professionalism', {})
        doc['attention_to_detail'] = self._clamp(doc.get('attention_to_detail'), 0, 5)
        doc['clarity_and_completeness'] = self._clamp(doc.get('clarity_and_completeness'), 0, 5)
        data['document_professionalism'] = doc
        return data

    # ================================================================ MAIN
    async def generate_report(self, interview, job, responses, cv_text):
        """
        Orchestrate all 4 parallel DeepSeek calls and merge into a single report dict.

        Args:
            interview: Interview ORM object
            job: Job ORM object
            responses: list of Response ORM objects
            cv_text: extracted CV text string
        Returns:
            dict – the complete report_data to store
        """
        if not self.enabled:
            return self._fallback_report(interview, job, responses)

        # Build inputs
        job_desc = f"{job.title}\n{job.description}\n{job.requirements or ''}"
        qa_pairs = []
        transcript_parts = []
        for r in responses:
            q_text = r.question.question if r.question else "Unknown question"
            a_text = r.answer_text or ""
            scores = {
                'relevance': r.relevance_score or 0,
                'technical': r.technical_score or 0,
                'communication': r.communication_score or 0,
                'confidence': r.confidence_score or 0,
            }
            qa_pairs.append((q_text, a_text, scores))
            transcript_parts.append(f"Interviewer: {q_text}\nCandidate: {a_text}")

        full_transcript = "\n\n".join(transcript_parts)

        # Expression counts from CV monitoring report
        monitoring = interview.cv_monitoring_report or {}
        expression_counts = monitoring.get('expression_counts', {})
        if not expression_counts:
            # Build from detection breakdown if available
            breakdown = monitoring.get('detection_breakdown', {})
            expression_counts = {
                'neutral_count': breakdown.get('neutral', 10),
                'happy_count': breakdown.get('happy', 2),
                'anxious_count': breakdown.get('anxious', 1),
                'surprised_count': breakdown.get('surprised', 0),
                'sad_count': breakdown.get('sad', 0),
                'angry_count': breakdown.get('angry', 0),
            }

        # Run all 4 calls in parallel
        call1 = self._call_interview_cv(job_desc, cv_text or "", qa_pairs, {})
        call2 = self._call_transcript_analysis(full_transcript)
        call3 = self._call_expression_analysis(expression_counts)
        call4 = self._call_cv_analysis(cv_text or "")

        results = await asyncio.gather(call1, call2, call3, call4, return_exceptions=True)

        report = {}
        labels = ['interview_cv', 'transcript_analysis', 'expression_analysis', 'cv_analysis']
        for label, result in zip(labels, results):
            if isinstance(result, Exception):
                logger.error(f"DeepSeek call '{label}' failed: {result}")
                report[label] = {'error': str(result)}
            else:
                report[label] = result

        # Flatten into top-level sections for frontend convenience
        icv = report.get('interview_cv', {})
        ta = report.get('transcript_analysis', {})
        ea = report.get('expression_analysis', {})
        ca = report.get('cv_analysis', {})

        report['overall_fit'] = {
            'score': icv.get('overall_score', 0),
            'summary': icv.get('summary', ''),
            'recommendations': icv.get('recommendations', []),
            'strengths': icv.get('strengths', []),
            'gaps': icv.get('gaps', []),
        }
        report['rubrics'] = icv.get('rubrics', [])
        report['communication_skills'] = ta.get('communication_skills', {})
        report['cognitive_insights'] = ta.get('cognitive_insights', {})
        report['vibe_panel'] = {
            'general_expression': ea.get('general_expression', 'Neutral'),
            'eye_contact': ea.get('eye_contact', 'Occasional'),
        }
        report['cv_profile_radar'] = ca.get('cv_profile_radar', {})
        report['red_flags'] = ca.get('red_flags', {})
        report['key_attributes'] = ca.get('key_attributes', {})
        report['document_professionalism'] = ca.get('document_professionalism', {})

        # Proctoring / integrity signals (read from monitoring data)
        detection_breakdown = monitoring.get('detection_breakdown', {})
        report['integrity_signals'] = {
            'multiple_faces': detection_breakdown.get('multiple_faces', 0) > 0,
            'multiple_faces_count': detection_breakdown.get('multiple_faces', 0),
            'face_out_of_view': detection_breakdown.get('no_face', 0) > 0,
            'face_out_of_view_count': detection_breakdown.get('no_face', 0),
            'gaze_off_screen_count': detection_breakdown.get('looking_away', 0),
            'gaze_flagged': detection_breakdown.get('looking_away', 0) > 5,
            'risk_score': monitoring.get('final_risk_score', 0),
            'risk_level': monitoring.get('risk_level', 'low'),
            'total_warnings': monitoring.get('total_warnings', 0),
        }

        # Pre-screening / Q&A data for sections 3 & 4 (already in DB, just include references)
        report['qa_pairs'] = [
            {
                'question': q,
                'answer': a,
                'scores': s,
                'is_followup': r.question.is_followup if r.question else False,
            }
            for (q, a, s), r in zip(qa_pairs, responses)
        ]

        # Metadata
        report['generated_at'] = datetime.utcnow().isoformat()
        report['cv_file_path'] = interview.cv_file_path
        report['recording_url'] = interview.recording_url

        return report

    def _fallback_report(self, interview, job, responses):
        """Return a minimal report when DeepSeek is unavailable."""
        qa_pairs = []
        for r in responses:
            q_text = r.question.question if r.question else ""
            a_text = r.answer_text or ""
            scores = {
                'relevance': r.relevance_score or 0,
                'technical': r.technical_score or 0,
                'communication': r.communication_score or 0,
                'confidence': r.confidence_score or 0,
            }
            qa_pairs.append({'question': q_text, 'answer': a_text, 'scores': scores, 'is_followup': False})

        avg_score = interview.final_score or 0
        monitoring = interview.cv_monitoring_report or {}
        detection_breakdown = monitoring.get('detection_breakdown', {})

        return {
            'overall_fit': {
                'score': round(avg_score / 10, 1),
                'summary': f'{interview.candidate_name} completed the interview with a score of {avg_score}/100.',
                'recommendations': ['Review detailed answers', 'Consider technical round', 'Check CV alignment'],
                'strengths': ['Completed full interview', 'Engaged with all questions', 'Submitted CV on time'],
                'gaps': ['Detailed AI analysis unavailable', 'Manual review recommended', 'Re-generate report when AI is available'],
            },
            'rubrics': [],
            'communication_skills': {'grammar': 2.5, 'fluency': 2.5, 'comprehension': 2.5, 'vocabulary_sufficiency': 2.5, 'coherence': 2.5},
            'cognitive_insights': {'logical_reasoning': 2.5, 'critical_thinking': 2.5, 'problem_solving': 2.5, 'big_picture_thinking': 2.5, 'insightfulness': 2.5, 'clarity': 2.5, 'decision_making': 2.5, 'intellectual_self_awareness': 2.5},
            'vibe_panel': {'general_expression': 'Neutral', 'eye_contact': 'Occasional'},
            'cv_profile_radar': {'strategic_focus': 2.5, 'learning_velocity': 2.5, 'career_progression': 2.5, 'drive_and_initiative': 2.5, 'intellectual_ability': 2.5, 'managerial_experience': 2.5, 'recognized_accomplishments': 2.5, 'original_and_creative_thinking': 2.5},
            'red_flags': {
                'timeline_and_tenure': {'flagged': False, 'detail': 'AI analysis unavailable'},
                'experience_and_representation': {'flagged': False, 'detail': 'AI analysis unavailable'},
                'other': {'flagged': False, 'detail': 'AI analysis unavailable'},
            },
            'key_attributes': {'experience_model': 'IC', 'leadership_potential': 2.5, 'entrepreneurial_spirit': 2.5, 'estimated_career_potential': 2.5, 'career_potential_explanation': 'AI analysis unavailable'},
            'document_professionalism': {'attention_to_detail': 2.5, 'clarity_and_completeness': 2.5},
            'integrity_signals': {
                'multiple_faces': detection_breakdown.get('multiple_faces', 0) > 0,
                'multiple_faces_count': detection_breakdown.get('multiple_faces', 0),
                'face_out_of_view': detection_breakdown.get('no_face', 0) > 0,
                'face_out_of_view_count': detection_breakdown.get('no_face', 0),
                'gaze_off_screen_count': detection_breakdown.get('looking_away', 0),
                'gaze_flagged': detection_breakdown.get('looking_away', 0) > 5,
                'risk_score': monitoring.get('final_risk_score', 0),
                'risk_level': monitoring.get('risk_level', 'low'),
                'total_warnings': monitoring.get('total_warnings', 0),
            },
            'qa_pairs': qa_pairs,
            'generated_at': datetime.utcnow().isoformat(),
            'cv_file_path': interview.cv_file_path,
            'recording_url': interview.recording_url,
        }
