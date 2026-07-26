import smtplib
try:
  server = smtplib.SMTP('smtp.gmail.com', 587)
  server.starttls()
  server.login('firasbessalahboos@gmail.com', 'vuoy vpfw jied aqyj')
  print('SUCCESS')
except Exception as e:
  print('ERROR:', e)
