FROM nginx:1.15.2

ADD dev/conf /etc/nginx/conf.d

RUN rm -rf etc/nginx/conf.d/default.conf

ADD dev/nginx_start.sh /etc/nginx/nginx_start.sh

RUN ["chmod","+x","/etc/nginx/nginx_start.sh"]

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["sh","/etc/nginx/nginx_start.sh"]