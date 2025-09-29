// 开发站点大全配置
window.DevSitesConfig = {
  // 前端开发
  frontend: [
    { name: 'MDN Web Docs', url: 'https://developer.mozilla.org', desc: 'Web开发权威文档', tags: ['文档', '教程'] },
    { name: 'Can I Use', url: 'https://caniuse.com', desc: '浏览器兼容性查询', tags: ['兼容性', '工具'] },
    { name: 'CSS-Tricks', url: 'https://css-tricks.com', desc: 'CSS技巧和教程', tags: ['CSS', '教程'] },
    { name: 'CodePen', url: 'https://codepen.io', desc: '前端代码演示平台', tags: ['演示', '社区'] },
    { name: 'JSFiddle', url: 'https://jsfiddle.net', desc: 'JavaScript在线编辑器', tags: ['编辑器', '演示'] },
    { name: 'Vue.js', url: 'https://vuejs.org', desc: 'Vue.js官方文档', tags: ['框架', '文档'] },
    { name: 'React', url: 'https://react.dev', desc: 'React官方文档', tags: ['框架', '文档'] },
    { name: 'Angular', url: 'https://angular.io', desc: 'Angular官方文档', tags: ['框架', '文档'] },
    { name: 'Bootstrap', url: 'https://getbootstrap.com', desc: 'Bootstrap CSS框架', tags: ['CSS', '框架'] },
    { name: 'Tailwind CSS', url: 'https://tailwindcss.com', desc: '实用优先的CSS框架', tags: ['CSS', '框架'] }
  ],

  // 后端开发
  backend: [
    { name: 'Spring Boot', url: 'https://spring.io/projects/spring-boot', desc: 'Java微服务框架', tags: ['Java', '框架'] },
    { name: 'Node.js', url: 'https://nodejs.org', desc: 'JavaScript运行时环境', tags: ['JavaScript', '运行时'] },
    { name: 'Express.js', url: 'https://expressjs.com', desc: 'Node.js Web框架', tags: ['Node.js', '框架'] },
    { name: 'Django', url: 'https://www.djangoproject.com', desc: 'Python Web框架', tags: ['Python', '框架'] },
    { name: 'Flask', url: 'https://flask.palletsprojects.com', desc: 'Python轻量级框架', tags: ['Python', '框架'] },
    { name: 'Laravel', url: 'https://laravel.com', desc: 'PHP Web框架', tags: ['PHP', '框架'] },
    { name: 'Ruby on Rails', url: 'https://rubyonrails.org', desc: 'Ruby Web框架', tags: ['Ruby', '框架'] },
    { name: 'ASP.NET Core', url: 'https://docs.microsoft.com/aspnet/core', desc: '.NET Web框架', tags: ['.NET', '框架'] },
    { name: 'Go', url: 'https://golang.org', desc: 'Go语言官网', tags: ['Go', '语言'] },
    { name: 'Rust', url: 'https://www.rust-lang.org', desc: 'Rust语言官网', tags: ['Rust', '语言'] }
  ],

  // 数据库
  database: [
    { name: 'MySQL', url: 'https://www.mysql.com', desc: '关系型数据库', tags: ['SQL', '数据库'] },
    { name: 'PostgreSQL', url: 'https://www.postgresql.org', desc: '开源关系型数据库', tags: ['SQL', '数据库'] },
    { name: 'MongoDB', url: 'https://www.mongodb.com', desc: 'NoSQL文档数据库', tags: ['NoSQL', '数据库'] },
    { name: 'Redis', url: 'https://redis.io', desc: '内存数据结构存储', tags: ['缓存', '数据库'] },
    { name: 'Elasticsearch', url: 'https://www.elastic.co', desc: '搜索和分析引擎', tags: ['搜索', '分析'] },
    { name: 'SQLite', url: 'https://www.sqlite.org', desc: '轻量级数据库', tags: ['SQL', '嵌入式'] },
    { name: 'Oracle', url: 'https://www.oracle.com/database', desc: '企业级数据库', tags: ['SQL', '企业'] },
    { name: 'SQL Server', url: 'https://www.microsoft.com/sql-server', desc: '微软数据库', tags: ['SQL', '微软'] }
  ],

  // 云服务
  cloud: [
    { name: 'AWS', url: 'https://aws.amazon.com', desc: '亚马逊云服务', tags: ['云计算', 'IaaS'] },
    { name: 'Azure', url: 'https://azure.microsoft.com', desc: '微软云服务', tags: ['云计算', 'IaaS'] },
    { name: 'Google Cloud', url: 'https://cloud.google.com', desc: '谷歌云服务', tags: ['云计算', 'IaaS'] },
    { name: 'Alibaba Cloud', url: 'https://www.alibabacloud.com', desc: '阿里云服务', tags: ['云计算', '国内'] },
    { name: 'Tencent Cloud', url: 'https://cloud.tencent.com', desc: '腾讯云服务', tags: ['云计算', '国内'] },
    { name: 'Vercel', url: 'https://vercel.com', desc: '前端部署平台', tags: ['部署', '前端'] },
    { name: 'Netlify', url: 'https://www.netlify.com', desc: 'JAMstack部署平台', tags: ['部署', 'JAMstack'] },
    { name: 'Heroku', url: 'https://www.heroku.com', desc: 'PaaS云平台', tags: ['PaaS', '部署'] }
  ],

  // 开发工具
  tools: [
    { name: 'Visual Studio Code', url: 'https://code.visualstudio.com', desc: '微软代码编辑器', tags: ['编辑器', 'IDE'] },
    { name: 'IntelliJ IDEA', url: 'https://www.jetbrains.com/idea', desc: 'JetBrains Java IDE', tags: ['IDE', 'Java'] },
    { name: 'WebStorm', url: 'https://www.jetbrains.com/webstorm', desc: 'JetBrains前端IDE', tags: ['IDE', '前端'] },
    { name: 'Sublime Text', url: 'https://www.sublimetext.com', desc: '轻量级代码编辑器', tags: ['编辑器'] },
    { name: 'Atom', url: 'https://atom.io', desc: 'GitHub代码编辑器', tags: ['编辑器'] },
    { name: 'Postman', url: 'https://www.postman.com', desc: 'API测试工具', tags: ['API', '测试'] },
    { name: 'Insomnia', url: 'https://insomnia.rest', desc: 'REST客户端', tags: ['API', '测试'] },
    { name: 'Docker', url: 'https://www.docker.com', desc: '容器化平台', tags: ['容器', 'DevOps'] },
    { name: 'Kubernetes', url: 'https://kubernetes.io', desc: '容器编排平台', tags: ['容器', '编排'] },
    { name: 'Jenkins', url: 'https://www.jenkins.io', desc: 'CI/CD自动化工具', tags: ['CI/CD', '自动化'] }
  ],

  // 版本控制
  vcs: [
    { name: 'GitHub', url: 'https://github.com', desc: '代码托管平台', tags: ['Git', '托管'] },
    { name: 'GitLab', url: 'https://gitlab.com', desc: 'DevOps平台', tags: ['Git', 'DevOps'] },
    { name: 'Bitbucket', url: 'https://bitbucket.org', desc: 'Atlassian代码托管', tags: ['Git', '托管'] },
    { name: 'Gitee', url: 'https://gitee.com', desc: '国内代码托管平台', tags: ['Git', '国内'] },
    { name: 'Git', url: 'https://git-scm.com', desc: '分布式版本控制', tags: ['版本控制'] },
    { name: 'SVN', url: 'https://subversion.apache.org', desc: '集中式版本控制', tags: ['版本控制'] }
  ],

  // 学习资源
  learning: [
    { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: '程序员问答社区', tags: ['问答', '社区'] },
    { name: 'GitHub', url: 'https://github.com', desc: '开源代码库', tags: ['开源', '代码'] },
    { name: '掘金', url: 'https://juejin.cn', desc: '中文技术社区', tags: ['社区', '中文'] },
    { name: 'CSDN', url: 'https://www.csdn.net', desc: '中文技术博客', tags: ['博客', '中文'] },
    { name: '博客园', url: 'https://www.cnblogs.com', desc: '中文技术博客', tags: ['博客', '中文'] },
    { name: 'LeetCode', url: 'https://leetcode.com', desc: '算法练习平台', tags: ['算法', '练习'] },
    { name: 'HackerRank', url: 'https://www.hackerrank.com', desc: '编程挑战平台', tags: ['挑战', '练习'] },
    { name: 'Coursera', url: 'https://www.coursera.org', desc: '在线课程平台', tags: ['课程', '学习'] },
    { name: 'Udemy', url: 'https://www.udemy.com', desc: '在线教育平台', tags: ['课程', '学习'] },
    { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', desc: '免费编程学习', tags: ['免费', '学习'] }
  ],

  // 设计资源
  design: [
    { name: 'Figma', url: 'https://www.figma.com', desc: '协作设计工具', tags: ['设计', '协作'] },
    { name: 'Adobe XD', url: 'https://www.adobe.com/products/xd.html', desc: 'Adobe设计工具', tags: ['设计', 'Adobe'] },
    { name: 'Sketch', url: 'https://www.sketch.com', desc: 'Mac设计工具', tags: ['设计', 'Mac'] },
    { name: 'Dribbble', url: 'https://dribbble.com', desc: '设计师作品展示', tags: ['设计', '灵感'] },
    { name: 'Behance', url: 'https://www.behance.net', desc: 'Adobe创意平台', tags: ['设计', '作品集'] },
    { name: 'Unsplash', url: 'https://unsplash.com', desc: '免费高质量图片', tags: ['图片', '免费'] },
    { name: 'Pexels', url: 'https://www.pexels.com', desc: '免费图片和视频', tags: ['图片', '视频'] },
    { name: 'IconFinder', url: 'https://www.iconfinder.com', desc: '图标搜索引擎', tags: ['图标', '搜索'] },
    { name: 'Font Awesome', url: 'https://fontawesome.com', desc: '图标字体库', tags: ['图标', '字体'] },
    { name: 'Google Fonts', url: 'https://fonts.google.com', desc: '免费Web字体', tags: ['字体', '免费'] }
  ],

  // 监控运维
  devops: [
    { name: 'Prometheus', url: 'https://prometheus.io', desc: '监控和告警系统', tags: ['监控', '告警'] },
    { name: 'Grafana', url: 'https://grafana.com', desc: '数据可视化平台', tags: ['可视化', '监控'] },
    { name: 'ELK Stack', url: 'https://www.elastic.co/elk-stack', desc: '日志分析平台', tags: ['日志', '分析'] },
    { name: 'Nginx', url: 'https://nginx.org', desc: 'Web服务器', tags: ['服务器', '代理'] },
    { name: 'Apache', url: 'https://httpd.apache.org', desc: 'Web服务器', tags: ['服务器'] },
    { name: 'Ansible', url: 'https://www.ansible.com', desc: '自动化运维工具', tags: ['自动化', '运维'] },
    { name: 'Terraform', url: 'https://www.terraform.io', desc: '基础设施即代码', tags: ['IaC', '自动化'] },
    { name: 'Vagrant', url: 'https://www.vagrantup.com', desc: '开发环境管理', tags: ['虚拟化', '环境'] }
  ],

  // AI工具与服务
  ai: [
    // 中国本土AI工具
    { name: '文心一言', url: 'https://yiyan.baidu.com', desc: '百度大语言模型', tags: ['对话', '写作', '中文', '百度'] },
    { name: '通义千问', url: 'https://tongyi.aliyun.com', desc: '阿里云大语言模型', tags: ['对话', '写作', '中文', '阿里'] },
    { name: '讯飞星火', url: 'https://xinghuo.xfyun.cn', desc: '科大讯飞认知大模型', tags: ['对话', '写作', '中文', '讯飞'] },
    { name: '豆包', url: 'https://www.doubao.com', desc: '字节跳动AI助手', tags: ['对话', '写作', '中文', '字节'] },
    { name: '元宝', url: 'https://yuanbao.tencent.com', desc: '腾讯混元大模型', tags: ['对话', '写作', '中文', '腾讯'] },
    { name: 'Kimi', url: 'https://kimi.moonshot.cn', desc: 'Moonshot AI长文本助手', tags: ['对话', '长文本', '中文'] },
    { name: '智谱清言', url: 'https://chatglm.cn', desc: '智谱AI对话助手', tags: ['对话', '写作', '中文'] },
    { name: '商汤商量', url: 'https://chat.sensetime.com', desc: '商汤科技AI助手', tags: ['对话', '写作', '中文'] },
    { name: '360智脑', url: 'https://ai.360.com', desc: '360大模型助手', tags: ['对话', '写作', '中文'] },
    { name: '天工AI', url: 'https://www.tiangong.cn', desc: '昆仑万维AI助手', tags: ['对话', '搜索', '中文'] },
    { name: '海螺AI', url: 'https://hailuoai.com', desc: 'MiniMax AI助手', tags: ['对话', '写作', '中文'] },
    { name: '秘塔AI', url: 'https://metaso.cn', desc: '秘塔科技AI搜索', tags: ['搜索', '问答', '中文'] },
    { name: '腾讯混元', url: 'https://hunyuan.tencent.com', desc: '腾讯混元大模型平台', tags: ['平台', 'API', '腾讯'] },
    { name: '百川智能', url: 'https://www.baichuan-ai.com', desc: '百川大模型平台', tags: ['平台', 'API', '中文'] },
    { name: '零一万物', url: 'https://www.lingyiwanwu.com', desc: '李开复零一万物AI', tags: ['对话', '平台', '中文'] },
    { name: 'DeepSeek', url: 'https://chat.deepseek.com', desc: '深度求索AI助手', tags: ['对话', '编程', '中文'] },
    { name: '即梦AI', url: 'https://jimeng.jianying.com', desc: '剪映AI图像生成', tags: ['图像', '生成', '字节'] },
    { name: '文心一格', url: 'https://yige.baidu.com', desc: '百度AI艺术创作', tags: ['图像', '艺术', '百度'] },
    { name: '通义万相', url: 'https://tongyi.aliyun.com/wanxiang', desc: '阿里AI图像生成', tags: ['图像', '生成', '阿里'] },
    { name: '可灵AI', url: 'https://kling.kuaishou.com', desc: '快手AI视频生成', tags: ['视频', '生成', '快手'] },
    { name: '剪映', url: 'https://www.capcut.cn', desc: '字节AI视频编辑', tags: ['视频', '编辑', '字节'] },
    { name: '腾讯智影', url: 'https://zenvideo.qq.com', desc: '腾讯AI视频制作', tags: ['视频', '制作', '腾讯'] },
    { name: 'Coze', url: 'https://www.coze.cn', desc: '字节AI Bot开发平台', tags: ['开发', '平台', '字节'] },
    { name: '扣子', url: 'https://www.coze.cn', desc: '字节AI应用搭建平台', tags: ['应用', '搭建', '字节'] },
    
    // 国际AI工具
    { name: 'ChatGPT', url: 'https://chat.openai.com', desc: 'OpenAI对话AI助手', tags: ['对话', '写作', '编程'] },
    { name: 'Claude', url: 'https://claude.ai', desc: 'Anthropic AI助手', tags: ['对话', '分析', '写作'] },
    { name: 'GitHub Copilot', url: 'https://github.com/features/copilot', desc: 'AI代码助手', tags: ['编程', '代码生成'] },
    { name: 'Cursor', url: 'https://cursor.sh', desc: 'AI代码编辑器', tags: ['编辑器', 'AI编程'] },
    { name: 'Midjourney', url: 'https://www.midjourney.com', desc: 'AI图像生成', tags: ['图像', '设计', '创作'] },
    { name: 'Stable Diffusion', url: 'https://stability.ai', desc: '开源AI图像生成', tags: ['图像', '开源', '生成'] },
    { name: 'DALL-E', url: 'https://openai.com/dall-e-3', desc: 'OpenAI图像生成', tags: ['图像', '创作'] },
    { name: 'Runway', url: 'https://runwayml.com', desc: 'AI视频生成与编辑', tags: ['视频', '编辑', '生成'] },
    { name: 'Perplexity', url: 'https://www.perplexity.ai', desc: 'AI搜索引擎', tags: ['搜索', '问答'] },
    { name: 'Notion AI', url: 'https://www.notion.so/product/ai', desc: '智能文档助手', tags: ['文档', '写作', '办公'] },
    { name: 'DeepL', url: 'https://www.deepl.com', desc: 'AI翻译工具', tags: ['翻译', '语言'] },
    { name: 'Grammarly', url: 'https://www.grammarly.com', desc: 'AI写作助手', tags: ['写作', '语法', '校对'] },
    { name: 'Jasper', url: 'https://www.jasper.ai', desc: 'AI内容创作平台', tags: ['内容', '营销', '写作'] },
    { name: 'Copy.ai', url: 'https://www.copy.ai', desc: 'AI文案生成工具', tags: ['文案', '营销'] },
    { name: 'Replicate', url: 'https://replicate.com', desc: 'AI模型云平台', tags: ['模型', '云服务', 'API'] },
    { name: 'Hugging Face', url: 'https://huggingface.co', desc: 'AI模型社区', tags: ['模型', '开源', '社区'] },
    { name: 'OpenAI API', url: 'https://platform.openai.com', desc: 'OpenAI API平台', tags: ['API', '开发'] },
    { name: 'Anthropic API', url: 'https://www.anthropic.com/api', desc: 'Claude API服务', tags: ['API', '开发'] },
    { name: 'Google AI Studio', url: 'https://aistudio.google.com', desc: 'Google AI开发平台', tags: ['开发', 'API'] },
    { name: 'Azure OpenAI', url: 'https://azure.microsoft.com/products/ai-services/openai-service', desc: '微软Azure AI服务', tags: ['云服务', 'API'] },
    { name: 'Cohere', url: 'https://cohere.com', desc: 'AI语言模型平台', tags: ['语言模型', 'API'] },
    { name: 'LangChain', url: 'https://www.langchain.com', desc: 'AI应用开发框架', tags: ['框架', '开发'] },
    { name: 'Pinecone', url: 'https://www.pinecone.io', desc: '向量数据库', tags: ['数据库', '向量', 'AI'] },
    { name: 'Weaviate', url: 'https://weaviate.io', desc: '开源向量数据库', tags: ['数据库', '向量', '开源'] },
    { name: 'Chroma', url: 'https://www.trychroma.com', desc: 'AI原生向量数据库', tags: ['数据库', '向量'] },
    { name: 'Weights & Biases', url: 'https://wandb.ai', desc: 'ML实验跟踪平台', tags: ['机器学习', '实验', '跟踪'] },
    { name: 'MLflow', url: 'https://mlflow.org', desc: 'ML生命周期管理', tags: ['机器学习', '管理', '开源'] },
    { name: 'TensorFlow', url: 'https://www.tensorflow.org', desc: 'Google机器学习框架', tags: ['框架', '机器学习'] },
    { name: 'PyTorch', url: 'https://pytorch.org', desc: 'Meta机器学习框架', tags: ['框架', '机器学习'] },
    { name: 'Ollama', url: 'https://ollama.ai', desc: '本地运行大语言模型', tags: ['本地', '模型', '开源'] }
  ]
};
