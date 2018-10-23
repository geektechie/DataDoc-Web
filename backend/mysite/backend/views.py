import datetime
import json

import jws
import jwt
from django.contrib.auth import authenticate
from django.contrib.sessions.models import Session
from django.contrib.auth.hashers import make_password
from django.contrib.auth.models import User
from django.http import HttpResponse
from django.http.response import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.response import Response
from rest_framework_jwt.authentication import jwt_decode_handler
from rest_framework_jwt.serializers import VerifyJSONWebTokenSerializer

from .models import UserProfile


def index(request):
    return HttpResponse("Home")

@csrf_exempt
def create_user(request):
    response = {}
    acc_data = {}
    if request.method == "POST":
        username = request.POST['username']
        fullname = request.POST['fullname']
        email = request.POST['email']
        password = request.POST['password']
        user = User.objects.create(username=username, email=email, password=make_password(password))
        user_prof_obj = UserProfile.objects.create(user_id=user.id, fullname=fullname, avatarpath="user2.png")
        response['username'] = user.username
        response['email'] = user.email
        response['password'] = user.password
        response['fullName'] = user_prof_obj.fullname
        response['avatarPath'] = None
        response['timezone'] = "Asia/Kolkata"
        response['admin'] = user.is_superuser
        response['dateFormat'] = None
        response['currency'] = "INR"
        response['company'] = None
        response['registered'] = True
        response['isConnectedWithGoogle'] = False
        response['isAccountClosed'] = False
        response['closeAccountDate'] = None
        response['role'] = None
        response['sessionId'] = "AEF6BC28D803BF4F0BD6833AABEFD3A7"
        response['manualEngineSelection'] = True
        response['id'] = user.id
        response['created'] = str(user_prof_obj.created)
        response['updated'] = None
        response['deleted'] = False
        acc_data['stripeCustomerId'] = "cus_Dorn7hqGMn36pd"
        acc_data['stripeSubscriptionId'] = None
        acc_data['stripeQuerySubscriptionId'] = None
        acc_data['stripeProcessingSubscriptionId'] = None
        acc_data['stripeFileStorageSubscriptionId'] = None
        acc_data['stripeSeEsStorageSubscriptionId'] = None
        acc_data['stripeSeBqStorageSubscriptionId'] = None
        acc_data['stripeUserSubscriptionId'] = None
        acc_data['numberOfLicenses'] = None
        acc_data['billingCycleAnchor'] = None
        acc_data['cardId'] = None
        acc_data['usedLicense'] = None
        acc_data['accountType'] = "INDIVIDUAL"
        acc_data['planType'] = "FREE"
        acc_data['id'] = 4001
        acc_data['created'] = None
        acc_data['deleted'] = False
        acc_data['closedNotes'] = []
        acc_data['freeAccount'] = True
        response['account'] = acc_data
    else:
        response['message'] = "Method not found!"
        response['error_code'] = 404
    return HttpResponse(json.dumps(response), content_type="application/json")

def current(request):
    response = {}
    acc_data = {}
    auth_token = request.META.get('HTTP_AUTHORIZATION', " ")
    try:
        payload = jwt_decode_handler(auth_token)
    except (jwt.ExpiredSignature, jwt.DecodeError, jwt.InvalidTokenError):
        response['message'] = "Signature is expired."
        response['error_code'] = 401
        return JsonResponse(response)
    data = {'token': auth_token}
    valid_data = VerifyJSONWebTokenSerializer().validate(data)
    user = valid_data['user']
    request.user = user
    if request.method == "GET":
        response['username'] = user.username
        response['email'] = user.email
        response['password'] = user.password
        response['fullName'] = user.userprofile.fullname
        response['avatarPath'] = str(user.userprofile.avatarpath)
        response['timezone'] = "Asia/Kolkata"
        response['admin'] = user.is_superuser
        response['dateFormat'] = None
        response['currency'] = "INR"
        response['company'] = None
        response['registered'] = True
        response['isConnectedWithGoogle'] = False
        response['isAccountClosed'] = False
        response['closeAccountDate'] = None
        response['role'] = None
        response['sessionId'] = None
        response['manualEngineSelection'] = True
        response['id'] = user.id
        response['created'] = str(user.userprofile.created)
        response['updated'] = None
        response['deleted'] = False
        acc_data['stripeCustomerId'] = "cus_Dorn7hqGMn36pd"
        acc_data['stripeSubscriptionId'] = None
        acc_data['stripeQuerySubscriptionId'] = None
        acc_data['stripeProcessingSubscriptionId'] = None
        acc_data['stripeFileStorageSubscriptionId'] = None
        acc_data['stripeSeEsStorageSubscriptionId'] = None
        acc_data['stripeSeBqStorageSubscriptionId'] = None
        acc_data['stripeUserSubscriptionId'] = None
        acc_data['numberOfLicenses'] = None
        acc_data['billingCycleAnchor'] = None
        acc_data['cardId'] = None
        acc_data['usedLicense'] = None
        acc_data['accountType'] = "INDIVIDUAL"
        acc_data['planType'] = "FREE"
        acc_data['id'] = 4001
        acc_data['created'] = None
        acc_data['deleted'] = False
        acc_data['closedNotes'] = []
        acc_data['freeAccount'] = True
        response['account'] = acc_data
    else:
        response['message'] = "Error! Please correct the errors below."
        response['error_code'] = 1
    return HttpResponse(json.dumps(response), content_type="application/json")

@csrf_exempt
def state(request, user_id):
    response = {}
    show_type = {}
    doc_sec = {}
    sort_sec1 = {}
    if request.method == "GET":
        user_obj = User.objects.filter(id=user_id).values()
        response['appConfig'] = None
        response['userId'] = user_obj[0]['id']
        response['activeSection'] = 0
        response['docsSectionColumns'] = [
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": False,
                    "direction": None
                }
            },
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": False,
                    "direction": "DESC"
                }
            },
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": False,
                    "direction": None
                }
            }
        ]
        response['sourcesSectionColumns'] = [
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": False,
                    "direction": None
                }
            },
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": False,
                    "direction": None
                }
            },
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": False,
                    "direction": "DESC"
                }
            }
        ]
        response['recentDocsSectionColumns'] =[
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": True,
                    "direction": None
                }
            },
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": True,
                    "direction": None
                }
            },
            {
                "selected": 0,
                "sortSettings": {
                    "disabled": True,
                    "direction": None
                }
            }
        ]
        response['recentSourcesSectionColumns'] =[
            {
                "selected":0,
                "sortSettings":{
                    "disabled":True,
                    "direction":None
                }
            },
            {
                "selected":0,
                "sortSettings":{
                    "disabled":True,
                    "direction":None
                }
            },
            {
                "selected":0,
                "sortSettings":{
                    "disabled":True,
                    "direction":None
                }
            }
        ]
        response['selectedFolderId'] = None
        show_type['datadocsOnly'] = True
        show_type['foldersOnly'] = True
        show_type['sourcesOnly'] = False
        response['showTypesOptions'] = show_type
        response['storageStrategyType'] = "ALWAYS_GCS"


    return HttpResponse(json.dumps(response), content_type="application/json")

def get_user_info(request):
    response = {}
    acc_data = {}
    auth_token = request.META.get('HTTP_AUTHORIZATION', " ")
    try:
        payload = jwt_decode_handler(auth_token)
    except (jwt.ExpiredSignature, jwt.DecodeError, jwt.InvalidTokenError):
        response['message'] = "Signature is expired."
        response['error_code'] = 401
        return JsonResponse(response)
    data = {'token': auth_token}
    valid_data = VerifyJSONWebTokenSerializer().validate(data)
    user = valid_data['user']
    request.user = user
    if request.method == "GET":
        response['username'] = user.username
        response['email'] = user.email
        response['password'] = user.password
        response['fullName'] = user.userprofile.fullname
        response['avatarPath'] = None
        response['timezone'] = "Asia/Kolkata"
        response['admin'] = user.is_superuser
        response['dateFormat'] = None
        response['currency'] = "INR"
        response['company'] = None
        response['registered'] = True
        response['isConnectedWithGoogle'] = False
        response['isAccountClosed'] = False
        response['closeAccountDate'] = None
        response['role'] = None
        response['sessionId'] = None
        response['manualEngineSelection'] = True
        response['id'] = user.id
        response['created'] = str(user.userprofile.created)
        response['updated'] = None
        response['deleted'] = False
        acc_data['stripeCustomerId'] = "cus_Dorn7hqGMn36pd"
        acc_data['stripeSubscriptionId'] = None
        acc_data['stripeQuerySubscriptionId'] = None
        acc_data['stripeProcessingSubscriptionId'] = None
        acc_data['stripeFileStorageSubscriptionId'] = None
        acc_data['stripeSeEsStorageSubscriptionId'] = None
        acc_data['stripeSeBqStorageSubscriptionId'] = None
        acc_data['stripeUserSubscriptionId'] = None
        acc_data['numberOfLicenses'] = None
        acc_data['billingCycleAnchor'] = None
        acc_data['cardId'] = None
        acc_data['usedLicense'] = None
        acc_data['accountType'] = None
        acc_data['planType'] = None
        acc_data['id'] = 4001
        acc_data['created'] = None
        acc_data['updated'] = None
        acc_data['deleted'] = False
        acc_data['closedNotes'] = []
        acc_data['freeAccount'] = False
        response['account'] = acc_data
        response['closedNotes'] = []
        response['freeUser'] = False
        response['name'] = user.userprofile.fullname
    else:
        response['message'] = "Error! Please correct the errors below."
        response['error_code'] = 1
    return HttpResponse(json.dumps(response), content_type="application/json")

def account(request):
    response={}
    response['stripeCustomerId'] = "cus_Dorn7hqGMn36pd"
    response['stripeSubscriptionId'] = None
    response['numberOfLicenses'] = None
    response['usedLicense'] = 1
    response['members'] =[
        {
            "email": "test@example.com",
            "role": None,
            "createdDate": "2018-10-23T04:49:21Z",
            "registered": True
        }
    ]
    response['accountType'] = "INDIVIDUAL"
    response['planType'] = "FREE"
    response['cardId'] = None
    response['companyName'] = None
    response['isPaymentDone'] = True
    response['freeUserLimit'] = 100000
    return HttpResponse(json.dumps(response), content_type="application/json")

@csrf_exempt
def billing_details(request):
    response = {}
    acc_data = {}
    if request.method == "POST":
        response['avatarPath'] = None
        response['timezone'] = "Asia/Kolkata"
        response['dateFormat'] = None
        response['currency'] = "INR"
        response['company'] = None
        response['registered'] = True
        response['isConnectedWithGoogle'] = False
        response['isAccountClosed'] = False
        response['closeAccountDate'] = None
        response['role'] = None
        response['sessionId'] = None
        response['manualEngineSelection'] = True
        response['updated'] = None
        response['deleted'] = False
        acc_data['stripeCustomerId'] = "cus_Dorn7hqGMn36pd"
        acc_data['stripeSubscriptionId'] = None
        acc_data['stripeQuerySubscriptionId'] = None
        acc_data['stripeProcessingSubscriptionId'] = None
        acc_data['stripeFileStorageSubscriptionId'] = None
        acc_data['stripeSeEsStorageSubscriptionId'] = None
        acc_data['stripeSeBqStorageSubscriptionId'] = None
        acc_data['stripeUserSubscriptionId'] = None
        acc_data['numberOfLicenses'] = None
        acc_data['billingCycleAnchor'] = None
        acc_data['cardId'] = None
        acc_data['usedLicense'] = None
        acc_data['accountType'] = "INDIVIDUAL"
        acc_data['planType'] = "FREE"
        acc_data['id'] = 4001
        acc_data['created'] = None
        acc_data['deleted'] = False
        acc_data['closedNotes'] = []
        acc_data['freeAccount'] = True
        response['account'] = acc_data
        response['closedNotes'] = []
        response['freeUser'] = True
    else:
        response['message'] = "Error! Please correct the errors below."
        response['error_code'] = 1
    return HttpResponse(json.dumps(response), content_type="application/json")