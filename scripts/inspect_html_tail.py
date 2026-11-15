with open(r"f:\startup  send mail\2026\ssc_parajumbles_cbt.html", "r", encoding="utf-8", errors="ignore") as f:
    text = f.read()

# find the last 4000 characters of the script
script_end = text.rfind("</script>")
print(text[script_end-4000:script_end])
