import importlib, json
packages = [
    'torch','whisper','ultralytics','mediapipe','langchain','chromadb','sentence_transformers','pyaudio','opencv','cv2'
]
results = {}
for p in packages:
    try:
        if p in ('opencv','cv2'):
            import cv2 as m
        else:
            m = importlib.import_module(p)
        info = {'ok': True}
        if p == 'torch':
            info['version'] = m.__version__
            info['cuda_available'] = m.cuda.is_available()
        else:
            info['version'] = getattr(m, '__version__', str(type(m)))
        results[p] = info
    except Exception as e:
        results[p] = {'ok': False, 'error': str(e)}
print(json.dumps(results, indent=2))
