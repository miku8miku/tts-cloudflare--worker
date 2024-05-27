addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
  });
  
  async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/generate' && request.method === 'POST') {
    return handleGenerate(request);
  } else {
    return handleHtmlRequest(request);
  }
  }
  
  async function handleHtmlRequest(request) {
    const html = `
    <!DOCTYPE html>
    <html lang="zh">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>文本转语音</title>
        <link rel="stylesheet" href="https://unpkg.com/element-ui/lib/theme-chalk/index.css">
    </head>
    <body>
        <div id="app">
            <div class="container">
                <el-card class="card-box">
                    <div class="content">
                        欢迎使用文本转语音
                        <el-input v-model="text" placeholder="请输入文本"></el-input>
                        <input type="file" @change="handleFileUpload">
                        <el-checkbox v-model="download">是否下载</el-checkbox>
                        <el-input v-model="audioType" placeholder="音频编码"></el-input>
                        <el-input v-model="voiceName" placeholder="模型名称"></el-input>
                        <el-input v-model="pitch" placeholder="播放速度"></el-input>
                        <el-button type="primary" @click="synthesizeText">合成</el-button>
                    </div>
                </el-card>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/vue@2"></script>
        <script src="https://unpkg.com/element-ui/lib/index.js"></script>
        <script>
            new Vue({
                el: '#app',
                data() {
                    return {
                        text: '',
                        download: false,
                        audioType: '',
                        voiceName: '',
                        pitch:''
                    };
                },
                methods: {
                    handleFileUpload(event) {
                        const file = event.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                                this.text = e.target.result;
                            };
                            reader.readAsText(file);
                        }
                    },
                    async synthesizeText() {
                        if (!this.text) {
                            this.$message.error('文本不能为空');
                            return;
                        }
                        
                        const params = {
                            text: this.text,
                            audioType: this.audioType,
                            voiceName: this.voiceName,
                            download: this.download,
                            pitch: this.pitch
                        };
    
                        try {
                            const response = await fetch('/generate', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(params)
                            });
    
                            if (response.ok) {
                                const audioBlob = await response.blob();
                                const audioUrl = URL.createObjectURL(audioBlob);
                                if (this.download) {
                                    const link = document.createElement('a');
                                    link.href = audioUrl;
                                    link.download = 'speech.mp3';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                } else {
                                    const audio = new Audio(audioUrl);
                                    audio.play().catch(error => console.error('播放失败:', error));
                                }
                            } else {
                                this.$message.error('合成失败，请重试');
                            }
                        } catch (error) {
                            console.error('请求失败:', error);
                            this.$message.error('请求失败，请重试');
                        }
                    }
                }
            });
        </script>
        <style scoped>
            .container {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
            }
    
            .card-box {
                width: 60%;
                max-width: 600px;
                margin: auto;
                padding: 20px;
                box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
            }
    
            .content {
                margin-top: 20px;
            }
        </style>
    </body>
    </html>`;
  
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html'
        }
    });
  }
  
  
  async function handleGenerate(request) {
  const { text, audioType, voiceName, download, pitch} = await request.json();
  return generateSpeechResponse(text, audioType, voiceName, download, pitch);
  }
  
  async function generateSpeechResponse(text, audioType, voiceName, download, pitch) {
  if (!text) {
    return new Response('Text parameter is required', { status: 400 });
  }
  
  const params = new URLSearchParams();
  params.append('text', text);
  if (audioType) params.append('audioType', audioType);
  if (voiceName) params.append('voiceName', voiceName);
  if (download) params.append('download', download);
  if (pitch) params.append('pitch', pitch);
  
  const url = `http://localhost:8080/api/tts?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
    throw new Error('Failed to fetch speech data');
    }
  
    const audioData = await response.arrayBuffer();
    return new Response(audioData, {
    headers: {
        'Content-Type': 'audio/mpeg',
    }
    });
  } catch (error) {
    return new Response('Error processing request: ' + error.message, { status: 500 });
  }
  }
  
