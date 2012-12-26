# -*- coding: utf-8 -*-


from core.app import BaseApp


class PromotionApp(BaseApp):

    urls_conf = 'promotion.urls'

application = PromotionApp
