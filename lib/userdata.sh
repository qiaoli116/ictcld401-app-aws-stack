sudo yum update -y
sudo yum install -y python3
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python3 get-pip.py
sudo pip3 install flask
sudo pip3 install mysql-connector-python
cd /home/ec2-user/
wget --output-document=python-app.zip https://github.com/qiaoli116/ictcld401-python-app/archive/refs/heads/main.zip
unzip python-app.zip
mv ictcld401-python-app-main python-app

# Uncomment and modify the configuration file with correct values
cd /home/ec2-user/python-app
# python3 setup.py --section Static --field base_url --value <base url string>
# python3 setup.py --section Database --field endpoint --value <endpoint string>
# python3 setup.py --section Database --field port --value <default is 3306>
# python3 setup.py --section Database --field user --value <database user name>
# python3 setup.py --section Database --field password --value <database password>

sudo tee /etc/systemd/system/my_python_app.service <<EOF
[Unit]
Description=My Flask App
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/python-app
ExecStart=/usr/bin/python3 /home/ec2-user/python-app/app.py
Restart=always

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start my_python_app.service
sudo systemctl enable my_python_app.service