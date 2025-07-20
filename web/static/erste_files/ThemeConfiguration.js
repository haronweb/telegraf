define({
    themes: {
		"default": {
            stylesheets: [
                "themes/erste/css/bootstrap.min.css",
                "css/erste-structure.css",
                "themes/erste/css/erste.css"
            ],
			path: "",
			icon: "themes/erste/images/favicon.ico",
			title: "Erste OpenAM",
            settings: {
                loginLogo: {
                    src: "themes/erste/images/e-logo.png",
                    title: "ForgeRock",
                    alt: "ForgeRock",
                    height: "28px",
                    width: "69px"
                },
                linkArrow: {
                    src: "themes/erste/images/a-arrow.png",
                }
            }
        },
        "erste-netbank-theme": {
            stylesheets: [
                "themes/erste/css/bootstrap.min.css",
                "css/erste-structure.css",
				"themes/erste/css/erste.css"
            ],
			path: "",
			icon: "themes/erste/images/favicon.ico",
			title: "Erste NetBank",
            settings: {
				customLoginHeader: true,
				newsEnabled: true,
				footerLinksEnabled: true,
				langChooser: true,
                loginLogo: {
                    src: "themes/erste/images/e-netbank-logo.png",
                    title: "ForgeRock",
                    alt: "ForgeRock",
                    height: "28px",
                    width: "185px"
                },
                langFlagHun: {
                    src: "themes/erste/images/lang-hun.png",
                },
                langFlagEng: {
                    src: "themes/erste/images/lang-eng.png",
                },
                linkArrow: {
                    src: "themes/erste/images/a-arrow.png",
                },
                atmSearch: {
                    src: "themes/erste/images/b_atm.png",
                }
            }
        },
        "georgeTheme": {
            stylesheets: [
                "george/css/bootstrap.min.css",
				"george/css/inter.css",
                "george/css/gds-main.min.css",
				"george/css/erste.css"
            ],
			path: "george/",
			icon: "images/favicon/",
			title: "George",
            settings: {
				footerLinksEnabled: true
            }
        },
        "storeTheme": {
            stylesheets: [
                "george/css/bootstrap.min.css",
				"george/css/inter.css",
                "george/css/gds-main.min.css",
				"george/css/erste.css"
            ],
			path: "george/",
			icon: "images/favicon/",
			title: "Store",
            settings: {
				footerLinksEnabled: true,
				oauthGoogleEnabled: true,
				oauthFacebookEnabled: false
            }
        },
        "openapiTheme": {
            stylesheets: [
                "george/css/bootstrap.min.css",
				"george/css/inter.css",
                "george/css/gds-main.min.css",
				"george/css/erste.css"
            ],
			path: "george/",
			icon: "images/favicon/",
			title: "OpenAPI",
            settings: {
				footerLinksEnabled: true
            }
        }
    },
    mappings: [
	{ theme: "erste-netbank-theme", realms: ["/netbank"] },
	{ theme: "openapiTheme", realms: ["/openapi"] },
	{ theme: "georgeTheme", realms: ["/george"] },
	{ theme: "storeTheme", realms: ["/store"] }
    ]
});

