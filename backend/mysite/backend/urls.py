from django.conf.urls import url
from rest_framework.urlpatterns import format_suffix_patterns
from . import views
from rest_framework_jwt.views import obtain_jwt_token


urlpatterns = [

    url(r'^api/auth/login$', obtain_jwt_token),
    url(r'^api/user/register$', views.create_user, name='create_user'),
    url(r'^api/auth/current$', views.current, name='current'),
    url(r'^api/auth/get_user_info', views.get_user_info, name='get_user_info'),
    url(r'^api/account$', views.account, name='account'),
    url(r'^api/user/billing-details$', views.billing_details, name='billing_details'),
    url(r'^api/user/state/(?P<user_id>\d+)$', views.state, name='state'),
    url(r'^$', views.index, name='index'),
]

urlpatterns = format_suffix_patterns(urlpatterns, allowed=['json', 'html'])