"use strict";

/**
 * The contents of this file are subject to the terms of the Common Development and
 * Distribution License (the License). You may not use this file except in compliance with the
 * License.
 *
 * You can obtain a copy of the License at legal/CDDLv1.0.txt. See the License for the
 * specific language governing permission and limitations under the License.
 *
 * When distributing Covered Software, include this CDDL Header Notice in each file and include
 * the License file at legal/CDDLv1.0.txt. If applicable, add the following below the CDDL
 * Header, with the fields enclosed by brackets [] replaced by your own identifying
 * information: "Portions copyright [year] [name of copyright owner]".
 *
 * Copyright 2015-2016 ForgeRock AS.
 */

define({
    themes: {
        // There must be a theme named "default".
        "default": {
            // An ordered list of URLs to stylesheets that will be applied to every page.
            stylesheets: ["css/bootstrap-3.3.5-custom.css", "css/structure.css", "css/theme.css"],
            // A path that is prepended to every relative URL when fetching resources (including images, stylesheets and
            // HTML template files).
            path: "",
            // A URL to a favicon icon
            icon: "images/favicon.ico",
            settings: {
                // This logo is displayed on user profile pages.
                logo: {
                    // The URL of the image.
                    src: "images/login-logo.png",
                    // The title attribute used on <img> tags.
                    title: "OpenAM",
                    // The alt attribute used on <img> tags.
                    alt: "OpenAM",
                    // The width of the logo as a CSS length.
                    height: "50px"
                },
                // This logo is displayed on login pages.
                loginLogo: {
                    // The URL of the image.
                    src: "images/login-logo.png",
                    // The title attribute used on <img> tags.
                    title: "OpenAM",
                    // The alt attribute used on <img> tags.
                    alt: "OpenAM",
                    // The width of the logo as a CSS length.
                    width: "400px"
                },
                // The footer is displayed on every page.
                footer: {
                    // A contact email address.
                    mailto: "open-identity-platform-openam@googlegroups.com",
                    // A contact phone number. If empty, it will not be displayed.
                    phone: ""
                }
            }
        },
        "fr-dark-theme": {
            // An ordered list of URLs to stylesheets that will be applied to every page.
            stylesheets: ["themes/dark/css/bootstrap.min.css", "css/structure.css", "themes/dark/css/theme-dark.css"],
            settings: {
                loginLogo: {
                    src: "themes/dark/images/login-logo-white.png",
                    title: "ForgeRock",
                    alt: "ForgeRock",
                    height: "228px",
                    width: "220px"
                }
            }
        },
        "rsso-theme": {
            // An ordered list of URLs to stylesheets that will be applied to every page.
            stylesheets: ["themes/rsso/css/bootstrap.min.css", "css/structure.css", "themes/rsso/css/theme-rsso.css", 
                "themes/rsso/css/rbsso.css"],
            path: "themes/rsso/",
            icon: "images/favicon.ico",
            settings: {
                loginLogoMini: {
                    src: "themes/rsso/images/raiffeissen-bank-530x270-q80.png",
                    title: "Raiffeisen",
                    alt: "Raiffeisen",
                    width: "150px"
                },
                loginLogo: {
                    src: "themes/rsso/images/raiffeissen-bank-530x270-q80.png",
                    title: "Raiffeisen",
                    alt: "Raiffeisen",
                    width: "400px"
                },
                letter: {
                    src: "themes/rsso/images/letter.jpg",
                    width: "20px"
                },
                cookieIcon: {
                    src: "themes/rsso/images/icon_cookie.png"
                },
                logo: {
                    src: "themes/rsso/images/logo.jpg"
                },
                arrowUp: {
                    src: "themes/rsso/images/arrow_up.jpg"
                },
                arrowDown: {
                    src: "themes/rsso/images/arrow_down.jpg"
                },
                activateSuccess: {
                    src: "themes/rsso/images/activate_success.png"
                }
            }
        },
    },
    // Each mapping will be tested in order. The theme from the first matching mapping will be used. If no mapping
    // matches then the theme "default" will be used.
    mappings: [
        // Use the theme with the key "my-theme" if the realm is either /my-realm or /my/sub-realm.
        //{ theme: "my-theme", realms: ["/my-realm", "/my/sub-realm"] }
        // Use the theme "my-second-theme" if the realm starts with /a. e.g. /ab or /a/c.
        //{ theme: "my-second-theme", realms: [/^\/a/] }
        // Use the theme "my-third-theme" if the realm is /a and the authentication chain is auth-chain-1.
        //{ theme: "my-third-theme", realms: ["/a"], authenticationChains: ["auth-chain-1"] }
        // Use the theme "my-fourth-theme" if the default authentication chain is in use.
        //{ theme: "my-fourth-theme", authenticationChains: [""] }
        { theme: "rsso-theme", realms: ["/rbsso", "/netbank"] }
    ]
});
