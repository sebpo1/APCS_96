FT.manifest({
    "filename": "index.html",
    "width": 300,
    "height": 600,
    "clickTagCount": 1,
    "hideBrowsers": ["ie11"],
    "instantAds": [

        { "name": "coverBackground", "type": "image", "default": "img/300x600_natural_health.png" },
        { "name": "coverHold", "type": "text", "default": "2" },
        { "name": "numOfLoops", "type": "text", "default": "1" },

        { "name": "carouselArrow", "type": "image", "default": "img/970x250-arrow-1217.png" },
        { "name": "carouselCTA", "type": "text", "default": "shop now" },
        { "name": "carouselCTAColour", "type": "text", "default": "#ec2927" },

        { "name": "carouselHeadline", "type": "image", "default": "img/300x600_flag.png" },

        { "name": "segmentId", "type": "text", "default": "false" },
        { "name": "feedEndpoint", "type": "text", "default": "https://fm.flashtalking.com/feed/1572/trending/master?ftCreds=1&numItems=7" },
        { "name": "defaultFeedEndpoint", "type": "text", "default": "https://fm.flashtalking.com/feed/1554/trending/master" },

        { "name": "backgroundImage", "type": "image", "default": "img/blank.png" },
        { "name": "colourBlock", "type": "text", "default": "#25408f" },

        { "name": "genericBackup", "type": "image", "default": "img/300x600_natural_health.png" },
        { "name": "genericClickthrough", "type": "text", "default": "https://www.thewarehousegroup.co.nz/" },

        { "name": "terms_button", "type": "text", "default": "[%image%] FREE SHIPPING" },
        { "name": "terms_image", "type": "image", "default": "img/arrow.png" },
        { "name": "promo_image", "type": "image", "default": "img/300x600_endframe.png" },
        { "name": "term_reveal_type", "type": "text", "default": "click" }

    ]
});