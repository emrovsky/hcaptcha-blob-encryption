from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

def encrypt_blob(version, blob_array):
    blob_array = str(blob_array)
    command = ['node', 'deobfuscator.js', version, blob_array]
        
    process = subprocess.Popen(
        command,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    stdout, stderr = process.communicate()
    if stderr:
        return {"error": stderr}
    return stdout.strip()

@app.route('/encrypt', methods=['POST'])
def encrypt():
    try:
        data = request.get_json()
        
        if not data or 'version' not in data or 'array' not in data:
            return jsonify({
                'error': 'Missing required fields. Please provide version and array'
            }), 400

        version = data['version']
        array = data['array']

        if not isinstance(array, list):
            return jsonify({
                'error': 'Array must be a list of numbers'
            }), 400

        result = encrypt_blob(version, array)
        
        return jsonify({
            'success': True,
            'result': result
        })

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=1337)