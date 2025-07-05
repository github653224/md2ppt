from flask import Flask, request, jsonify, send_from_directory, render_template
import os
import json
import logging

app = Flask(__name__)

# 配置静态文件目录
app.static_folder = 'static'

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'),
                               'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/images/<path:filename>')
def serve_image(filename):
    """服务images目录中的图片文件"""
    return send_from_directory(os.path.join(app.root_path, 'images'), filename)

@app.route('/')
@app.route('/slides')
@app.route('/slides/<path:dir_name>')
def index(dir_name=''):
    return render_template('index.html', dir_name=dir_name)

@app.route('/slides-data/')
@app.route('/slides-data/<path:dir_name>')
def get_slides(dir_name=''):
    base_path = os.path.join('slides', dir_name) if dir_name else 'slides'
    
    # 检查目录是否存在
    if not os.path.exists(base_path):
        return jsonify({
            'status': 'error',
            'message': f'Directory {base_path} does not exist'
        })
        
    # 检查list.json文件是否存在
    list_json_path = os.path.join(base_path, 'list.json')
    if not os.path.exists(list_json_path):
        return jsonify({
            'status': 'error',
            'message': f'list.json not found in {base_path}'
        })
    
    # 读取对应目录下的list.json
    with open(list_json_path, 'r', encoding='utf-8') as f:
        slide_list = json.load(f)
        
        try:
            # 读取对应目录下的所有MD文件
            slides = {}
            for slide_file in slide_list['slides']:
                slide_path = os.path.join(base_path, slide_file)
                if not os.path.exists(slide_path):
                    logging.warning(f'File {slide_file} not found in {base_path}')
                    continue
                try:
                    with open(slide_path, 'r', encoding='utf-8') as f:
                        slides[slide_file] = f.read()
                except Exception as e:
                    logging.warning(f'Failed to read file {slide_file}: {str(e)}')
                    continue

            return jsonify({
                'status': 'success',
                'slides': slides,
                'list': slide_list
            })
        except Exception as e:
            logging.exception('An error occurred while reading slides')
            return jsonify({
                'status': 'error',
                'message': f'Error reading slides: {str(e)}'
            })

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


@app.route('/upload/<path:keyword>', methods=['POST'])
def upload_md(keyword):
    # 检查是否有文件上传
    if 'file' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No file part'
        }), 400
    
    file = request.files['file']
    
    # 检查文件名是否为空
    if not file.filename:
        return jsonify({
            'status': 'error',
            'message': 'No selected file'
        }), 400
    
    # 检查文件扩展名是否为 .md
    if not file.filename.endswith('.md'):
        return jsonify({
            'status': 'error',
            'message': 'Only .md files are allowed'
        }), 400
    
    # 构建目标目录路径
    target_dir = os.path.join('slides', keyword)
    
    # 检查目标目录是否存在
    if not os.path.exists(target_dir):
        return jsonify({
            'status': 'error',
            'message': f'Directory {target_dir} does not exist'
        }), 404
    
    # 保存文件到目标目录
    file_path = os.path.join(target_dir, file.filename)
    file.save(file_path)
    
    # 处理 list.json 文件
    list_json_path = os.path.join(target_dir, 'list.json')
    
    if os.path.exists(list_json_path):
        # 读取现有的 list.json
        with open(list_json_path, 'r', encoding='utf-8') as f:
            slide_list = json.load(f)
    else:
        # 创建新的 list.json
        slide_list = {'slides': []}
    
    # 添加新文件到列表
    if file.filename not in slide_list['slides']:
        slide_list['slides'].append(file.filename)
    
    # 保存更新后的 list.json
    with open(list_json_path, 'w', encoding='utf-8') as f:
        json.dump(slide_list, f, indent=4)
    
    return jsonify({
        'status': 'success',
        'message': f'File {file.filename} uploaded successfully',
        'path': file_path
    })

if __name__ == '__main__':
    logging.basicConfig(level=logging.WARNING)
    app.run(debug=True, port=5001, host='0.0.0.0')