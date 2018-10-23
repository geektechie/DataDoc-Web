# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.contrib import admin
from django.contrib.sessions.models import Session

from .models import UserProfile



class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('fullname', 'user', 'avatarpath', 'created', 'modified')

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'userprofile'

class SessionAdmin(admin.ModelAdmin):
    def _session_data(self, obj):
        return obj.get_decoded()

    list_display = ['session_key', '_session_data', 'expire_date']

admin.site.register(Session, SessionAdmin)
admin.site.register(UserProfile, UserProfileAdmin);
