FROM nginx:1.15.2

ADD build /var/www/datadocs
ADD conf /etc/nginx/conf.d
RUN rm -rf etc/nginx/conf.d/default.conf

RUN echo "daemon off;" >> /etc/nginx/nginx.conf

EXPOSE 80

CMD ["/usr/sbin/nginx"]