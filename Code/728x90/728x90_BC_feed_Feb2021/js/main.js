// global variables
var clickthrough = false;
var itemid = "default";
var feedPopulated = false;
var errorEncountered = false;
var clicked = false;
var notCover = false;
var feedLength = 0;
var currSlide = 0;
var coverHold = 0;
var totalProds = 7;
var urls = [];
var ids = [];
var carousel;
var term_reveal_type = 'click';

var concatfeed;

// LOADERS
var ftLoader = {
    toload: ["instantads", "feed", "images", "fonts", "arrow", "background"],
    promoImagesToLoad: [],
    promoImagesSuccess: [],
    promoImagesError: [],
    loaded: [],
    ticker: setInterval(function() {
        if (
            ftLoader.toload.length !== ftLoader.loaded.length ||
            ftLoader.promoImagesToLoad.length !==
            ftLoader.promoImagesSuccess.length + ftLoader.promoImagesError.length
        )
            return;

        clearInterval(ftLoader.ticker);
        init();
    }, 500),
};
// setInterval(function(){ console.log(ftLoader.loaded); }, 100);

WebFont.load({
    custom: { families: ["Gotham Narrow"] },
    active: function() {
        ftLoader.loaded.push("fonts");
    },
});


function dynamicImage(name, url, cb) {
    var self = this;
    this.name = name;
    this.handler = function() {
        var elem = self.name.replace("_image", "").replace(/_/g, "-");
        myFT.$("#" + elem).css({
            "background-image": 'url("' + this.src + '")',
            // 'width': this.width/2 + 'px'
            width: this.width + "px",
        });
        if (self.cb) self.cb();
    };
    this.image = new Image();
    this.image.onload = this.handler;
    this.image.onerror = this.handler;
    this.image.src = url;
    this.cb = cb ? cb : false;
}

// DYNAMIC TO LOAD
myFT.on("instantads", function() {
    var arrowImg = new Image();
    arrowImg.src = myFT.instantAds.carouselArrow;
    arrowImg.onload = function(e) {
        ftLoader.loaded.push("arrow");
    };
    myFT.$("#navLeft")[0].style.backgroundImage =
        'url("' + myFT.instantAds.carouselArrow + '")';
    myFT.$("#navRight")[0].style.backgroundImage =
        'url("' + myFT.instantAds.carouselArrow + '")';

    myFT.$("#container")[0].style.backgroundImage =
        'url("' + myFT.instantAds.backgroundImage + '")';
    myFT.$("#colourBlock")[0].style.backgroundColor = myFT.instantAds.colourBlock.trim();
    myFT.$("#cta")[0].style.backgroundColor = myFT.instantAds.carouselCTAColour.trim();

    var bgImg = new Image();
    bgImg.src = myFT.instantAds.backgroundImage;
    bgImg.onload = function(e) {
        ftLoader.loaded.push("background");
    };
    //fill headline flag
    var flagImg = new Image();
    flagImg.src = myFT.instantAds.carouselHeadline;
    flagImg.onload = function(e) {
        ftLoader.loaded.push("carouselHeadline");
    };
    myFT.$("#carouselHeadline img")[0].src = flagImg.src;

    // fill in the CTA
    myFT.$("#cta")[0].innerHTML = myFT.instantAds.carouselCTA;

    // hide the cover frame if it's not required
    if (myFT.instantAds.coverHold.trim() == "0") {
        myFT.$("#coverFrame")[0].style.display = "none";
    } else {
        // add this to the ftLoader
        ftLoader.toload.push("cover");
        // load cover
        var coverImg = new Image();
        coverImg.src = myFT.instantAds.coverBackground;
        coverImg.onload = function(e) {
            ftLoader.loaded.push("cover");
        };
        myFT.$("#coverFrame img")[0].src = coverImg.src;
    }

    //terms pop-up
    if (myFT.instantAds.rollover_disclaimer !== "") {
        myFT.$("#rollover_disclaimer")[0].innerHTML = myFT.instantAds.terms_button.replace("[%image%]", "<img src=" + myFT.instantAds.terms_image + ">");
    }

    ftLoader.toload.push("promo");
    var promoImage = new Image();
    promoImage.src = myFT.instantAds.promo_image;
    promoImage.onload = function(e) {
        ftLoader.loaded.push("promo");
    };
    myFT.$("#promo_image img")[0].src = promoImage.src;

    // myFT.$("#promo_image img")[0].src= myFT.instantAds.promoImage;

    term_reveal_type = myFT.instantAds.term_reveal_type ? myFT.instantAds.term_reveal_type : 'click';
    if (myFT.instantAds.terms_copy == "") {
        myFT.$("#rollover_disclaimer")[0].style.display = "none";
        myFT.$("#promo_image")[0].style.display = "none";
    }

    // other dynamic data
    failsafe = myFT.instantAds.carouselCTA == "" ? true : false;
    clickthrough =
        myFT.instantAds.genericClickthrough.toLowerCase() === "false" ?
        false :
        myFT.instantAds.genericClickthrough;
    // cover settings
    coverHold = isNaN(parseInt(myFT.instantAds.coverHold)) ?
        3 :
        parseInt(myFT.instantAds.coverHold);

    ftLoader.loaded.push("instantads");

    // dynamic content is complete
    var ftFeed = new FTFeed(myFT);
    ftFeed.getFeed(loadSecondFeed, feedLoadError);
});

function loadSecondFeed(feedItems, feedUrl) {
    // temp store the existing products
    concatfeed = feedItems;
    // load additional trending feed items
    //myFT.instantAds.feedEndpoint = myFT.instantAds.defaultFeedEndpoint;
    var ftFeed = new FTFeed(myFT);
    ftFeed.getFeed(feedLoaded, feedLoadError);
}

// the feedLoaded function will fire if the feed is successfully loaded
function feedLoaded(feedItems, feedUrl) {
    // concat the feeds
    //concatfeed = concatfeed.concat(feedItems);
    feedItems = concatfeed;

    // start the feed stuff
    if (feedItems[0].length !== 0 && feedItems !== "") {
        // if feed does not deliver an empty response
        // console.log("Feed URL: " + feedUrl);
        // for testing
        // console.log(feedItems); 
        feedLength = feedItems.length; // fixed length

        // track success, get the valid product IDs
        var feed_products = "";
        var numProds = 0;
        for (var i = 0; i < feedLength; i++) {
            if (numProds !== totalProds) {
                numProds++;
                feed_products += feedItems[i].id;
                if (numProds < totalProds) {
                    feed_products += "_";
                }
            }
        }

        if (i == feedLength && numProds < totalProds) {
            feedLoadError("not enough products to use", feedUrl);
        } else {
            Tracker.impressionTrackEvent("success__" + feed_products);
            // console.log(feed_products);

            // construct the carousel
            buildCarousel(feedItems, feedUrl);

        }
    } else {
        // empty response from feed
        feedLoadError("empty feed response", feedUrl);
    }
}

// the feedLoadError function fires is the feed is not reachable
function feedLoadError(errorMsg, feedUrl) {
    errorEncountered = true;
    // track fails
    Tracker.impressionTrackEvent("default");
    console.log(errorMsg + ". Feed URL: " + feedUrl);
    // default functionality here if the feed doesn't load
    // apply dynamic clicktag for the banner
    myFT.applyButton(myFT.$("#container"), function(e) {
        // generic clickthrough
        myFT.clickTag(1, clickthrough);
    });

    // load backup as background
    var backupImg = new Image();
    backupImg.src = myFT.instantAds.genericBackup;
    backupImg.onload = function(e) {
        ftLoader.loaded.push("images");
    };
    myFT.$("#container")[0].style.backgroundImage =
        'url("' + myFT.instantAds.genericBackup + '")';

    // hide the carousel, headlines, terms
    myFT.$("#carouselContainer")[0].style.display = "none";
    // myFT.$("#coverFrame")[0].style.display = "none";
    // myFT.$("#coverAnim")[0].style.display = "none";
    // myFT.$("#cta")[0].style.display = "none";
    // myFT.$("#logo")[0].style.display = "none";

    // load content and start animation
    if (ftLoader.loaded.indexOf("feed") == -1) {
        ftLoader.loaded.push("feed");
    }
}

// create the carousel and account for different situations
function buildCarousel(feedItems, feedUrl) {
    feedPopulated = true;
    
    // apply dynamic clicktag for the banner
    myFT.applyButton(myFT.$("#clickTag"), function(e) {
        if (notCover) {
            carousel.stop();
        }
        // don't clickthrough if navigation is clicked
        if (e.target.className.toLowerCase().indexOf("nav") == -1) {
            if (feedPopulated && notCover && e.target.id.includes(`prod`)) {
                console.log(e.target.id.substring(4));
                setProductValues(e.target.id.substring(4));
                Tracker.clickTrackEvent("click__" + itemid);
                myFT.clickTag(1, clickthrough);
                // console.log("click__" + itemid);
            } else {
                Tracker.clickTrackEvent("click__default");
                console.log("click__default");
                myFT.clickTag(1, myFT.instantAds.genericClickthrough);
            }
            //   myFT.clickTag(1, clickthrough);
            console.log(urls);
            console.log(ids);
            console.log(clickthrough);
        }
    });

    var numSlides = 0;
    // fill in the content
    for (var i = 0; i < feedLength; i++) {
        if (numSlides !== totalProds) {
            numSlides++;

            ids.push(feedItems[i].id);
            urls.push(feedItems[i].link);
            
            var slideElem = document.createElement("li");
            slideElem.id = `slide${i}`;
            slideElem.classList.add("slide");
            // slideElem.classList.add("left");
            document.querySelector("#productCarousel").appendChild(slideElem);
            // console.log(numSlides);
            var slide = myFT.$("ul li")[numSlides - 1];
            // console.log(slide);
            slide.classList += " " + feedItems[i].id;

            // fill in the slide contents
            var productContainer = document.createElement("div");
            productContainer.className = "productContainer adsize";

            var productImage = document.createElement("div");
            productImage.className = "productImage";
            var feedImage =
                feedItems[i].powerfeeds_image
                .replace("h=500", "h=270")
                .replace("w=500", "w=270") + "&removeBackground";
            productImage.style.backgroundImage = 'url("' + feedImage + '")';

            if (numSlides == 1) {
                var image = new Image();
                image.src = feedImage;
                image.onload = function() {
                    ftLoader.loaded.push("images");
                };
            }

            var productInfo = document.createElement("div");
            productInfo.className = "productInfo";

            var productName = document.createElement("div");
            productName.className = "productName";
            productName.innerHTML = feedItems[i].powerfeeds_name;

            var productPriceContainer = document.createElement("div");
            productPriceContainer.className = "productPriceContainer";

            var promotion = document.createElement("div");
            promotion.className = "promotion";
            promotion.innerHTML = feedItems[i].promotion_id;

            var productRetailPrice = document.createElement("div");

           

            if (
                feedItems[i].price.toLowerCase() == "n/a" ||
                feedItems[i].price == undefined ||
                feedItems[i].price == ""
            ) {
                var amendedPrice = parseFloat(feedItems[i].price)
                    .toFixed(2)
                    .replace("NZD", "");
            } else {
                var amendedPrice = parseFloat(feedItems[i].price)
                    .toFixed(2)
                    .replace("NZD", "");
                // var amendedPrice = parseFloat(feedItems[i].promotion_id).toFixed(2).replace(".00", "");
            }
            if (amendedPrice.indexOf(".") > -1) {
                amendedPrice =
                    amendedPrice.replace(".", "<span class='cents'>") + "</span>";
            }

            

            // productRetailPrice.innerHTML = "<span class='dollar'>$</span>" + amendedPrice;
             // Update code
            var integerPartNumber = parseInt(amendedPrice);
            var removeDecimal = amendedPrice.replace(integerPartNumber,'');
            var decimalPartNumber = removeDecimal.replace(/[^0-9]/g,'');
            if(integerPartNumber>=100){
                productRetailPrice.className = "productRetailPrice threeDigit";
            }else if(!promotion) {
                productRetailPrice.className = "productRetailPrice centTemplate";
            }else
                productRetailPrice.className = "productRetailPrice";

            // var priceIdText = feedItems[i].promotion_id.trim().toLowerCase();
            // if(!priceIdText || priceIdText == 'n/a' || priceIdText == '') {
            //     productRetailPrice.classList.add('margin_top');
            // }

            if(feedItems[i].powerfeeds_price>1){
                amendedPrice = "<span class='decimal'>"+integerPartNumber+"</span><span class='cents'>"+decimalPartNumber+"</span>";
                if(feedItems[i].powerfeeds_price >= 100) {
                    amendedPrice = "<span class='decimal smallDecimal'>"+integerPartNumber+"</span><span class='cents'>"+decimalPartNumber+"</span>";
                }

                productRetailPrice.innerHTML =
                "<span class='dollar'>$</span>" +
                amendedPrice;
            }else{
               centdPrice = "<span class='decimal'>"+decimalPartNumber+"</span><span class='cents'>c</span>";
                productRetailPrice.innerHTML =
                centdPrice;
            }

            productPriceContainer.appendChild(productRetailPrice);
            productInfo.appendChild(productPriceContainer);
            productInfo.appendChild(productName);
            productInfo.id = `prod${i}`;
            
            productContainer.appendChild(productInfo);
            productContainer.appendChild(productImage);
            
            slide.appendChild(productContainer);
            // Text Resize
            if(slide.querySelector('.promotion')!=null){
                textResize(slide.querySelector('.promotion'),76,17.8);
            }
        }
    }

    // generate carousel
    carousel = new Carousel({
        elem: "carouselContainer", // id of the carousel container
        autoplay: false, // starts the rotation automatically
        infinite: true, // enables the infinite mode
        interval: 2800, // interval between slide changes
        initial: 0, // slide to start with
    });

    // load content and start animation
    ftLoader.loaded.push("feed");
}

function init() {
    // feed has loaded
    if (feedPopulated) {
        // hide nav
        if (feedLength == 1) {
            myFT.$("#navRight")[0].style.display = "none";
            myFT.$("#navLeft")[0].style.display = "none";
        }

        // truncate copy
        shave(".productName", 50);

        // text resize
        for (
            i = 0; i < document.getElementsByClassName("productName").length; i++
        ) {
            // textResize(myFT.$(".productRetailPrice")[i], 113, 95);
        }

        // for (i = 0; i < document.getElementsByClassName("cta").length; i++) {
        //     textResize(myFT.$(".cta")[i], 102, 21);
        // }
        // clicktag terms
        myFT.applyButton(myFT.$('#container'), function(e) {
            if (e.target.id == "rollover_disclaimer" && term_reveal_type == 'click') {
                openTerms();
                myFT.$("#closeButton")[0].style.opacity = 1;
            } else { closeTerms(); };
        });

        // add listeners
        myFT.$("#navRight")[0].addEventListener("click", shiftCarousel);
        myFT.$("#navLeft")[0].addEventListener("click", shiftCarousel);

        var rotateCount = 0;
        // transition
        myFT
            .$("#productCarousel")[0]
            .addEventListener("transitionend", function(e) {
                if (notCover) {
                    currSlide = parseInt(carousel.live());
                    rotateCount++;
                    // console.log(carousel.live(), currSlide, rotateCount, totalProds);

                    if (clicked == false) {
                        // stop the rotation
                        if (rotateCount >= totalProds) {
                            // console.log("stop the animation");
                            carousel.stop();
                        } else {
                            f = currSlide + 1;
                        }
                    }
                }
            });

        // show the ad, without impacting the timeline
        TweenLite.to(container, 0.2, {
            opacity: 1,
            onComplete: function() {
                // console.log("showing");
                animate();
            },
        });
    } else {
        // show the default
        TweenLite.to(container, 0.2, { opacity: 1 });
    }
}

// ANIMATION
function animate() {

    // start the animation
    tl = new TimelineMax();

    // cover frame only
    if (parseInt(myFT.instantAds.coverHold.trim()) > 0) {

        tl.set(navLeft, { display: "block" }, coverHold);
        tl.set(navRight, { display: "block" }, coverHold);

        tl.to(
            coverFrame,
            0.5, { x: -1 * myFT.manifestProperties.width },
            coverHold + 0.5
        );
        tl.fromTo(
            carouselContainer,
            0.5, { x: myFT.manifestProperties.width }, { x: 0 },
            "-=0.5"
        );
        tl.to(
            cta,
            0.5, {
                opacity: 1,
                onStart: function() {
                    notCover = true;
                    carousel.play();
                },
            },
            coverHold + 1
        );
        
        tl.fromTo(navLeft, 0.5, { opacity: 0 }, { opacity: 1 });
        tl.fromTo(navRight, 0.5, { opacity: 0 }, { opacity: 1 }, "-=0.5");

        tl.fromTo(promo_frame, 0.5, { opacity: 0 }, { opacity: 1 }, "+=7");

    } else {
        tl.set(coverFrame, { display: "none" });
        // tl.fromTo(carouselContainer, 0.5, { x: myFT.manifestProperties.width }, { x: 0 }, "-=0.5");

        tl.set(navLeft, { display: "block" });
        tl.set(navRight, { display: "block" });

        tl.to(cta, 0.5, {
            opacity: 1,
            onStart: function() {
                notCover = true;
                carousel.play();
            },
        });

        tl.fromTo(navLeft, 0.5, { opacity: 0 }, { opacity: 1 });
        tl.fromTo(navRight, 0.5, { opacity: 0 }, { opacity: 1 }, "-=0.5");
    }

    // console.log("duration: " + tl.duration());
}

// SET TRACKING AND CLICKTHROUGH
function setProductValues(n) {
    clickthrough = urls[n];
    itemid = ids[n];
}

// INTERACTIONS
function shiftCarousel(e) {
    clicked = true;
    carousel.stop();

    // move left
    if (e.target.id.toLowerCase().indexOf("left") > -1) {
        carousel.prev();
    }
    // move right
    if (e.target.id.toLowerCase().indexOf("right") > -1) {
        carousel.next();
    }
}
function openTerms() {
    tl.pause();
    TweenLite.to("#rollover_disclaimer", 0.3, { opacity: 0 });
    TweenLite.to("#promo_frame", 0.5, { opacity: 1, ease: Power2.easeOut });
}

function closeTerms() {
    TweenLite.to("#rollover_disclaimer", 0.3, { opacity: 1 });
    TweenLite.to("#promo_frame", 0.3, { opacity: 0, ease: Power2.easeOut });
    tl.resume();
}

function ctaOver() {
    // myFT.$("#cta")[0].style.backgroundColor = myFT.instantAds.brandColour2.trim();
}

function ctaOut() {
    // myFT.$("#cta")[0].style.backgroundColor = myFT.instantAds.brandColour1.trim();
}

// HELPER FUNCTIONS
function textResize(e, w, h) {
    // console.log(e, e.scrollHeight, h, e.scrollWidth, w);
    var i = 0;
    while (e.scrollHeight > h || e.scrollWidth > w) {
        fs = window.getComputedStyle(e, null).getPropertyValue("font-size");
        e.style.fontSize = parseInt(fs, 10) - 1 + "px";
        if (i < 40) {
            i++;
        } else {
            break;
        } // break after 40 tries
    }
}

if(navigator.platform.match('Mac') !== null) {
    document.body.setAttribute('class', document.body.className +'macOSX');
}