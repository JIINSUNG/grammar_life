# 레거시 단일 HTML 빌드: python3 build.py → grammar-app.html
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'src'))
c=open('shell.html',encoding='utf-8').read()
files=['data.js','more_data.js','jp_n3.js','jp_n2.js','jp_more1.js','jp_more2.js','jp_more3.js','basics.js','en_more.js','vocab_ja.js','vocab_en.js','vocab_more.js','ruby_dict.js','app.js']
s=c+"<script>\n"+"\n".join(open(f,encoding='utf-8').read() for f in files)+"\n</script>\n"
open('../grammar-app.html','w',encoding='utf-8').write(s)
print('ok',len(s))
