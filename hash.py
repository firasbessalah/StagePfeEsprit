import bcrypt
hash = bcrypt.hashpw(b'123456789', bcrypt.gensalt(rounds=10))
# Spring expects $2a$ format usually, passlib or older bcrypt handles it better.
# Let's just output the $2b$ hash.
print(hash.decode('utf-8'))
