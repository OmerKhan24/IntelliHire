"""
ATS (Applicant Tracking System) Scoring Service
Scores candidate CVs against job requirements using DeepSeek.
"""
import json
import logging
import asyncio
from datetime import datetime

logger = logging.getLogger(__name__)


class ATSScoringService:
    """Score CVs against job requirements via DeepSeek API."""

    def __init__(self, api_key: str):
        from openai import AsyncOpenAI
        self.client = AsyncOpenAI(api_key=api_key, base_url="https://api.deepseek.com")
        self.model = "deepseek-chat"

    async def score_cv(self, cv_text: str, job_title: str, job_description: str, job_requirements: str) -> dict:
        """Score a single CV against the job. Returns {score, breakdown, summary}."""
        prompt = f"""You are an expert ATS (Applicant Tracking System) scorer.

JOB TITLE: {job_title}
JOB DESCRIPTION:
{job_description}

JOB REQUIREMENTS:
{job_requirements or 'Not specified'}

CANDIDATE CV TEXT:
{cv_text[:4000]}

Score this CV against the job on these dimensions (each 0-100):
1. skills_match - How well do the candidate's skills match the requirements?
2. experience_relevance - How relevant is their work experience?
3. education_fit - Does their education background fit?
4. keyword_match - How many relevant keywords from the job appear in the CV?
5. overall_quality - CV clarity, professionalism, completeness

Respond ONLY with valid JSON:
{{
  "overall_score": <weighted average 0-100>,
  "breakdown": {{
    "skills_match": <0-100>,
    "experience_relevance": <0-100>,
    "education_fit": <0-100>,
    "keyword_match": <0-100>,
    "overall_quality": <0-100>
  }},
  "matched_skills": ["skill1", "skill2", ...],
  "missing_skills": ["skill1", "skill2", ...],
  "summary": "<2-3 sentence assessment>"
}}"""

        try:
            from services.deepseek_rate_limiter import RateLimitedCall
            async with RateLimitedCall():
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a precise ATS scorer. Return only valid JSON."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=800
                )
            raw = response.choices[0].message.content.strip()
            # Strip markdown fences
            if raw.startswith("```"):
                raw = raw.split("\n", 1)[1] if "\n" in raw else raw[3:]
                raw = raw.rsplit("```", 1)[0]
            result = json.loads(raw)
            # Clamp score
            result['overall_score'] = max(0, min(100, float(result.get('overall_score', 0))))
            for k in result.get('breakdown', {}):
                result['breakdown'][k] = max(0, min(100, float(result['breakdown'][k])))
            return result
        except Exception as e:
            logger.error(f"ATS scoring failed: {e}")
            return {
                'overall_score': 0,
                'breakdown': {
                    'skills_match': 0, 'experience_relevance': 0,
                    'education_fit': 0, 'keyword_match': 0, 'overall_quality': 0
                },
                'matched_skills': [],
                'missing_skills': [],
                'summary': f'Scoring failed: {str(e)}'
            }

    async def score_batch(self, applications: list, job_title: str, job_description: str, job_requirements: str) -> list:
        """Score multiple applications concurrently.
        
        Args:
            applications: list of dicts with {id, cv_text}
            job_title, job_description, job_requirements: from the Job model
        
        Returns:
            list of {application_id, score_result} dicts
        """
        tasks = []
        for app in applications:
            task = self.score_cv(
                cv_text=app['cv_text'] or '',
                job_title=job_title,
                job_description=job_description,
                job_requirements=job_requirements
            )
            tasks.append((app['id'], task))

        results = []
        # Process in batches of 5 to avoid rate limits
        batch_size = 5
        for i in range(0, len(tasks), batch_size):
            batch = tasks[i:i + batch_size]
            batch_results = await asyncio.gather(*[t[1] for t in batch], return_exceptions=True)
            for (app_id, _), result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    logger.error(f"Scoring failed for application {app_id}: {result}")
                    result = {
                        'overall_score': 0,
                        'breakdown': {},
                        'matched_skills': [],
                        'missing_skills': [],
                        'summary': f'Scoring error: {str(result)}'
                    }
                results.append({'application_id': app_id, 'score_result': result})

        return results

    def shortlist(self, scored_applications: list, max_shortlist: int) -> tuple:
        """Given scored apps, return (shortlisted_ids, rejected_ids).
        
        Args:
            scored_applications: list of (application_id, ats_score) tuples
            max_shortlist: how many to keep
        
        Returns:
            (shortlisted_ids: list, rejected_ids: list)
        """
        # Sort by score descending
        sorted_apps = sorted(scored_applications, key=lambda x: x[1], reverse=True)
        shortlisted = [app_id for app_id, _ in sorted_apps[:max_shortlist]]
        rejected = [app_id for app_id, _ in sorted_apps[max_shortlist:]]
        return shortlisted, rejected
