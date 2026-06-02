#!/usr/bin/env python3
# ITOps 去品牌化脚本
# 用法: python3 brand-fix.py <input.js> [output.js]

import sys

input_file = sys.argv[1] if len(sys.argv) > 1 else "index-v2.js"
output_file = sys.argv[2] if len(sys.argv) > 2 else input_file

with open(input_file, "rb") as f:
    c = f.read()

# 安全文本替换（hex 编码中文，兼容 Python 3.6）
c = c.replace(b"ITOps Agent", b"\xe6\x99\xba\xe8\x83\xbd\xe8\x87\xaa\xe5\x8a\xa8\xe5\x8c\x96\xe5\xb9\xb3\xe5\x8f\xb0")  # 智能自动化平台
c = c.replace(b"www.zjzwfw.cloud", b"")
c = c.replace(b"https://www.zjzwfw.cloud/", b"#")
c = c.replace(b"DeepSeek", b"AI\xe5\x88\x86\xe6\x9e\x90")  # AI分析
c = c.replace(b"IT Operations Multi-Agent Automation Platform", b"\xe8\xbf\x90\xe7\xbb\xb4\xe6\x99\xba\xe8\x83\xbd\xe8\x87\xaa\xe5\x8a\xa8\xe5\x8c\x96\xe5\xb9\xb3\xe5\x8f\xb0")  # 运维智能自动化平台
# 修复双"平台"
c = c.replace(b"\xe6\x99\xba\xe8\x83\xbd\xe8\x87\xaa\xe5\x8a\xa8\xe5\x8c\x96\xe5\xb9\xb3\xe5\x8f\xb0 \xe5\xb9\xb3\xe5\x8f\xb0", b"\xe6\x99\xba\xe8\x83\xbd\xe8\x87\xaa\xe5\x8a\xa8\xe5\x8c\x96\xe5\xb9\xb3\xe5\x8f\xb0")

with open(output_file, "wb") as f:
    f.write(c)

print(f"Done: {len(c)} bytes written to {output_file}")
