from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    fullname = models.CharField(max_length=100, blank=True)
    avatarpath = models.ImageField(upload_to='Pictures')
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True)

# class Account(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     stripeCustomerId = models.CharField(max_length=100, blank=True)
#     stripeSubscriptionId = models.CharField(max_length=100, blank=True)
#     stripeQuerySubscriptionId = models.CharField(max_length=100, blank=True)
#     stripeProcessingSubscriptionId = models.CharField(max_length=100, blank=True)
#     stripeFileStorageSubscriptionId = models.CharField(max_length=100, blank=True)
#     stripeSeEsStorageSubscriptionId = models.CharField(max_length=100, blank=True)
#     stripeSeBqStorageSubscriptionId = models.CharField(max_length=100, blank=True)
#     stripeUserSubscriptionId = models.CharField(max_length=100, blank=True)
#     numberOfLicenses = models.CharField(max_length=100, blank=True)
#     billingCycleAnchor = models.CharField(max_length=100, blank=True)
#     cardId = models.CharField(max_length=100, blank=True)
#     usedLicense = models.CharField(max_length=100, blank=True)
#     accountType = models.CharField(max_length=100, blank=True)
#     planType = models.CharField(max_length=100, blank=True)
#     created = models.DateTimeField(auto_now_add=True)
#     updated = models.DateTimeField(auto_now=True)
#     deleted = models.BooleanField(default=False)
#     closedNotes =  models.CharField(max_length=100, blank=True)
#     freeAccount = models.BooleanField(default=False)
