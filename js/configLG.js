﻿/*global dojo, define */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
/** @license
| Version 10.2
| Copyright 2013 Esri
|
| Licensed under the Apache License, Version 2.0 (the "License"); you
| may not use this file except in compliance with the License.
| You may obtain a copy of the License at
|
|    http://www.apache.org/licenses/LICENSE-2.0
|
| Unless required by applicable law or agreed to in writing, software
| distributed under the License is distributed on an "AS IS" BASIS,
| WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
| See the License for the specific language governing permissions and
| limitations under the License.
*/
define([], function () {
    return {

        // This file contains various configuration settings for esri template
        //
        // Use this file to perform the following:
        //
        // 1.  Specify application Name                      - [ Tag(s) to look for: ApplicationName ]
        // 2.  Set path for application icon                 - [ Tag(s) to look for: ApplicationIcon ]
        // 3.  Set path for application favicon              - [ Tag(s) to look for: ApplicationFavicon ]
        // 4.  Set URL for help page                         - [ Tag(s) to look for: HelpURL ]
        // 5.  Specify URLs for base maps                    - [ Tag(s) to look for: BaseMapLayers ]
        // 6.  Specify URLs for operational layers           - [ Tag(s) to look for: OperationalLayers]
        // 7.  Customize zoom level for address search       - [ Tag(s) to look for: ZoomLevel ]
        // 8.  Customize address search settings            - [ Tag(s) to look for: LocatorSettings]
        // 9.  Set URL for geometry service                 - [ Tag(s) to look for: GeometryService ]
        // 10. Specify URLs for map sharing                  - [ Tag(s) to look for: MapSharingOptions,TinyURLServiceURL, TinyURLResponseAttribute, FacebookShareURL, TwitterShareURL, ShareByMailLink ]
        // 11.  Specify header widget settings                - [ Tag(s) to look for: AppHeaderWidgets ]

        // ------------------------------------------------------------------------------------------------------------------------
        // GENERAL SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set application title
        ApplicationName: "Site Selector",

        // Set application icon path
        ApplicationIcon: "/js/library/themes/images/site-selector-logo.png",

        // Set application Favicon path
        ApplicationFavicon: "/js/library/themes/images/faviconBlue.ico",

        // Set URL of help page/portal
        HelpURL: "help.htm",

        // Set custom logo url, displayed in lower left corner. Set to empty "" to disable.
        CustomLogoUrl: "The Site Selector application helps individuals and businesses to explore a region and discover information that can aid in business decision-making. To locate Building(s) or Site(s) that are for sale or lease, select the Building or Site tab, enter an address in the search box, or use your current location, adjust the search parameters, and search. The building(s) or site(s) will be listed on the map with relevant information about available locations meeting your search criteria. To explore Business(es) or Communities, select the Business or Communities tab, enter an address in the search box, or use your current location, adjust the search parameters, and select enter. The Business(es) or Communities will then be listed on the map with relevant information meeting your search criteria.",

        // Set splash window content - Message that appears when the application starts
        SplashScreen: {
            SplashScreenContent: "",
            IsVisible: true
        },

        ThemeColor: "js/library/themes/styles/blueTheme.css",

        PortalAPIURL: "http://www.arcgis.com/sharing/rest/",
        // Specify the title of group that contains basemaps
        BasemapGroupTitle: "Basemapsdev",
        // Specify the user name of owner of the group that contains basemaps
        BasemapGroupOwner: "lkingdev",
        // Specify spatial reference for basemaps, since all basemaps need to use the same spatial reference
        BasemapSpatialReferenceWKID: 102100,
        // Specify path to image used to display the thumbnail for a basemap when portal does not provide it
        NoThumbnail: "js/library/themes/images/not-available.png",

        // Set geometry service URL
        GeometryService: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer",

        // Set geoenrichment service URL
        GeoEnrichmentService: "http://geoenrich.arcgis.com/arcgis/rest/services/World/geoenrichmentserver",

        // Following zoom level will be set for the map upon searching an address
        ZoomLevel: 16,

        //minimum height should be 310 for the info-popup in pixels
        InfoPopupHeight: 250,

        // Minimum width should be 330 for the info-popup in pixels
        InfoPopupWidth: 300,

        // Set string value to be shown for null or blank values
        ShowNullValueAs: "N/A",

        ShowMapAttribution: true,


        // Set proxy url
        ProxyUrl: "/proxy/proxy.ashx",

        // Set buffer distance unit
        DistanceUnitSettings: {
            DistanceUnitName: "Miles", // Allowed values for DistanceUnitName are "Miles", "Kilometers", "Meters" and "Feet".
            MinimumValue: 1,
            MaximumValue: 10
        },

        // Set buffer symbology
        BufferSymbology: {
            FillSymbolColor: "255,0,0",
            FillSymbolTransparency: "0.20",
            LineSymbolColor: "255,0,0",
            LineSymbolTransparency: "0.30"
        },
        DatePattern: "MMMM dd, yyyy",
        RippleColor: "0,255,255",
        LocatorRippleSize: 40,

        // WORKFLOW SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Configure workflows

        // Name: Specify the workflow name. Workflow names have to be unique. It is displayed in the tabs in search panel.
        // WebMapId: Specify the WebMapId for operational layers. Mandatory if Buildings and Sites workflows are enabled.
        // SearchSettings: Configure search settings for each workflow.
        // Title: Must match layer name specified in webmap.
        // QueryLayerId: This is the layer index in the webmap and is used for performing queries.
        // SearchDisplayTitle: This text is displayed in search results as the title to group results.
        // SearchDisplayFields: Attribute that will be displayed in the search box when user performs a search.
        // SearchExpression: Configure the query expression to be used for search.
        // FilterSettings: Configure filtering options for buildings, sites and business workflows.
        // FilterRangeFields: Configure field to display as range search option.
        // FilterOptionFields: Configure fields and attribute values to display as checkbox option.
        // InfoPanelSettings: Configure settings for items shown in info panel.
        // ResultContents: Used in Buildings and Sites workflows for displaying list of search results.
        // LayerContents: Used in Buildings and Sites workflows for displaying detailed information of Building or Site.
        // GeoEnrichmentContents: Configure settings to display data collections or variables from geoenrichment.
        // DownloadSettings: Configure settings for downloading reports from geoprocessing service or geoenrichment.

        WebMapId: "a4ae42ba5a2645f4a575299c4b1664b4",
        Workflows: [
            {
                Name: "Buildings",
                Enabled: true,
                SearchSettings: [
                    {
                        Title: "Improved Sites",
                        QueryLayerId: "0",
                        SearchDisplayTitle: "Improved Sites",
                        SearchDisplayFields: "${FACNAME}, ${FACTYPE}, ${SITEZIP}",
                        SearchExpression: "UPPER(FACNAME) LIKE UPPER('${0}%') OR UPPER(FACTYPE) LIKE UPPER('${0}%') OR UPPER(SITEZIP) LIKE UPPER('${0}%')",

                        FilterSettings: {
                            FilterRangeFields: [
                                {
                                    DisplayText: "Area (sqft)",
                                    FieldName: "BLDGAREA"
                                }
                            ],
                            RegularFilterOptionFields: [
                            ],

                            AdditionalFilterOptions: {
                                Enabled: true,
                                FilterFieldName: "ZONEDESC",
                                FilterOptions: [
                                    {
                                        DisplayText: "Agricultural",
                                        FieldValue: "Agricultural"
                                    }, {
                                        DisplayText: "Industrial",
                                        FieldValue: "Industrial"
                                    }, {
                                        DisplayText: "Office",
                                        FieldValue: "Office"
                                    }, {
                                        DisplayText: "Retail",
                                        FieldValue: "Retail"
                                    }
                                ]
                            }
                        }
                    }
                ],
                InfoPanelSettings: {
                    ResultContents: {
                        ShowAttachments: true,
                        DisplayFields: [
                            {
                                DisplayText: "Name:",
                                FieldName: "FACNAME",
                                SortingEnabled: true
                            }, {
                                DisplayText: "Address:",
                                FieldName: "FULLADDR",
                                SortingEnabled: false
                            }, {
                                DisplayText: "Municipality:",
                                FieldName: "MUNICIPALITY",
                                SortingEnabled: true
                            }, {
                                DisplayText: "Zipcode:",
                                FieldName: "SITEZIP",
                                SortingEnabled: true
                            }, {
                                DisplayText: "County:",
                                FieldName: "SITECOUNTY",
                                SortingEnabled: true
                            }, {
                                DisplayText: "Area (sqft):",
                                FieldName: "BLDGAREA",
                                SortingEnabled: true
                            }

                        ]
                    },
                    LayerContents: {
                        ShowAttachments: true,
                        DisplayTitle: "Property Information",
                        DisplayFields: [
                            {
                                DisplayText: "Name:",
                                FieldName: "FACNAME"
                            }, {
                                DisplayText: "Address:",
                                FieldName: "FULLADDR"
                            }, {
                                DisplayText: "County:",
                                FieldName: "SITECOUNTY"
                            }, {
                                DisplayText: "Zipcode:",
                                FieldName: "SITEZIP"
                            }, {
                                DisplayText: "Type:",
                                FieldName: "ZONEDESC"
                            }, {
                                DisplayText: "Area (sqft):",
                                FieldName: "BLDGAREA"
                            }
                        ]
                    },
                    GeoenrichmentDistance: {
                        Unit: "UNIT_STATUTE_MILE",
                        BufferDistance: 1
                    },
                    GeoEnrichmentContents: {
                        DisplayTitle: "Neighborhood Information",
                        DisplayFields: [
                            {
                                DisplayText: "Dominant Tapestry Segment",
                                FieldName: "Policy.TSEGNAME"
                            }, {
                                DisplayText: "Labor Force Participation Rate",
                                FieldName: "Industry.CIVLBFR_CY"
                            }, {
                                DisplayText: "Total Population",
                                FieldName: "KeyUSFacts.TOTPOP_CY"
                            }, {
                                DisplayText: "Total Households",
                                FieldName: "KeyUSFacts.TOTHH_CY"
                            }, {
                                DisplayText: "Average Household Size",
                                FieldName: "KeyUSFacts.AVGHHSZ_CY"
                            }, {
                                DisplayText: "Average Household Income",
                                FieldName: "KeyUSFacts.AVGHINC_CY"
                            }, {
                                DisplayText: "Median Household Income",
                                FieldName: "KeyUSFacts.MEDHINC_CY"
                            }, {
                                DisplayText: "Per Capita Income",
                                FieldName: "KeyUSFacts.PCI_CY"
                            }, {
                                DisplayText: "Total Housing Units",
                                FieldName: "KeyUSFacts.TOTHU_FY"
                            }, {
                                DisplayText: "Owner Occupied HUs",
                                FieldName: "KeyUSFacts.OWNER_CY"
                            }, {
                                DisplayText: "Renter Occupied HUs",
                                FieldName: "KeyUSFacts.RENTER_CY"
                            }, {
                                DisplayText: "Vacant Housing Units",
                                FieldName: "KeyUSFacts.VACANT_CY"
                            }, {
                                DisplayText: "Median Home Value",
                                FieldName: "KeyUSFacts.MEDVAL_CY"
                            }, {
                                DisplayText: "Average Home Value",
                                FieldName: "KeyUSFacts.AVGVAL_CY"
                            }
                        ]
                    },
                    DownloadSettings: [
                        {
                            DisplayOptionTitle: "Property Information",
                            GeoProcessingServiceURL: "http://54.241.236.56:6080/arcgis/rest/services/SiteSelector_UAT/GeneratePDFReport/GPServer/SiteSelectorPDFGen",
                            Filetype: "PDF" //allowed PDF
                        }
                    ]
                }
            }, {
                Name: "Sites",
                Enabled: true,
                SearchSettings: [
                    {
                        Title: "Vacant Land Sites",
                        QueryLayerId: "1",
                        SearchDisplayTitle: "Sites",
                        SearchDisplayFields: "${FACNAME}, ${FACTYPE}, ${FULLADDR}",
                        SearchExpression: "UPPER(FACNAME) LIKE UPPER('${0}%') OR UPPER(FACTYPE) LIKE UPPER('${0}%') OR UPPER(FULLADDR) LIKE UPPER('${0}%')",
                        FilterSettings: {
                            FilterRangeFields: [
                                {
                                    DisplayText: "Area (acres)",
                                    FieldName: "TOTAREA"
                                }
                            ],
                            RegularFilterOptionFields: [
                            ],
                            AdditionalFilterOptions: {
                                Enabled: true,
                                FilterFieldName: "ZONEDESC",
                                FilterOptions: [
                                    {
                                        DisplayText: "Residential",
                                        FieldValue: "Residential"
                                    }, {
                                        DisplayText: "Industrial",
                                        FieldValue: "Industrial"
                                    }, {
                                        DisplayText: "Office",
                                        FieldValue: "Office"
                                    }, {
                                        DisplayText: "Retail",
                                        FieldValue: "Retail"
                                    }
                                ]
                            }
                        }
                    }
                ],
                InfoPanelSettings: {
                    ResultContents: {
                        ShowAttachments: true,
                        DisplayFields: [
                            {
                                DisplayText: "Name:",
                                FieldName: "FACNAME",
                                SortingEnabled: true
                            }, {
                                DisplayText: "Address:",
                                FieldName: "FULLADDR",
                                SortingEnabled: true
                            }, {
                                DisplayText: "County:",
                                FieldName: "SITECOUNTY",
                                SortingEnabled: false
                            }, {
                                DisplayText: "Area (acres):",
                                FieldName: "TOTAREA",
                                SortingEnabled: true
                            }, {
                                DisplayText: "Zipcode:",
                                FieldName: "SITEZIP",
                                SortingEnabled: false
                            }
                        ]
                    },
                    LayerContents: {
                        ShowAttachments: true,
                        DisplayTitle: "Site Information",
                        DisplayFields: [
                            {
                                DisplayText: "Name:",
                                FieldName: "FACNAME"
                            }, {
                                DisplayText: "Address:",
                                FieldName: "FULLADDR"
                            }, {
                                DisplayText: "County:",
                                FieldName: "SITECOUNTY"
                            }, {
                                DisplayText: "Zipcode:",
                                FieldName: "SITEZIP"
                            }, {
                                DisplayText: "Type:",
                                FieldName: "ZONEDESC"
                            }, {
                                DisplayText: "Area (acres):",
                                FieldName: "TOTAREA"
                            }
                        ]
                    },
                    GeoenrichmentDistance: {
                        Unit: "UNIT_STATUTE_MILE",
                        BufferDistance: 1
                    },
                    GeoEnrichmentContents: {
                        DisplayTitle: "Neighborhood Information",

                        DisplayFields: [
                            {
                                DisplayText: "Dominant Tapestry Segment",
                                FieldName: "Policy.TSEGNAME"
                            }, {
                                DisplayText: "Labor Force Participation Rate",
                                FieldName: "Industry.CIVLBFR_CY"
                            }, {
                                DisplayText: "Total Population",
                                FieldName: "KeyUSFacts.TOTPOP_CY"
                            }, {
                                DisplayText: "Total Households",
                                FieldName: "KeyUSFacts.TOTHH_CY"
                            }, {
                                DisplayText: "Average Household Size",
                                FieldName: "KeyUSFacts.AVGHHSZ_CY"
                            }, {
                                DisplayText: "Average Household Income",
                                FieldName: "KeyUSFacts.AVGHINC_CY"
                            }, {
                                DisplayText: "Median Household Income",
                                FieldName: "KeyUSFacts.MEDHINC_CY"
                            }, {
                                DisplayText: "Per Capita Income",
                                FieldName: "KeyUSFacts.PCI_CY"
                            }, {
                                DisplayText: "Total Housing Units",
                                FieldName: "KeyUSFacts.TOTHU_FY"
                            }, {
                                DisplayText: "Owner Occupied HUs",
                                FieldName: "KeyUSFacts.OWNER_CY"
                            }, {
                                DisplayText: "Renter Occupied HUs",
                                FieldName: "KeyUSFacts.RENTER_CY"
                            }, {
                                DisplayText: "Vacant Housing Units",
                                FieldName: "KeyUSFacts.VACANT_CY"
                            }, {
                                DisplayText: "Median Home Value",
                                FieldName: "KeyUSFacts.MEDVAL_CY"
                            }, {
                                DisplayText: "Average Home Value",
                                FieldName: "KeyUSFacts.AVGVAL_CY"
                            }
                        ]
                    },
                    DownloadSettings: [
                        {
                            DisplayOptionTitle: "Site Information",
                            GeoProcessingServiceURL: "http://54.241.236.56:6080/arcgis/rest/services/SiteSelector_UAT/GeneratePDFReport/GPServer/SiteSelectorPDFGen",
                            Filetype: "PDF" //allowed PDF
                        }, {
                            DisplayOptionTitle: "Traffic Count Profile",
                            GeoEnrichmentReportName: "traffic",
                            Filetype: "PDF" //allowed PDF or XLSX
                        }
                    ]
                }
            }, {
                Name: "Business",
                Enabled: true,
                FilterSettings: {
                    BusinesSortOptions: { Option: "Count,Revenue,Employees" },
                    FilterRangeFields: [
                        {
                            DisplayText: "Annual Revenue ($)",
                            VariableNameSuffix: "_SALES"
                        }, {
                            DisplayText: "Number of employees",
                            VariableNameSuffix: "_EMP"
                        }
                    ]
                },
                InfoPanelSettings: {
                    GeoEnrichmentContents: [
                        {
                            DisplayTitle: "Business Information",
                            DisplayTextForBusinessCount: "Count",
                            BusinessDataCollectionName: "IndustryByNAICSCode",

                            BusinessSummaryFields: [
                                {
                                    DisplayText: "Businesses",
                                    FieldName: "IndustryByNAICSCode.DN01_BUS"
                                }, {
                                    DisplayText: "Revenue",
                                    FieldName: "IndustryByNAICSCode.DN01_SALES"
                                }, {
                                    DisplayText: "Employees",
                                    FieldName: "IndustryByNAICSCode.DN01_EMP"
                                }, {
                                    DisplayText: "Unemployment",
                                    FieldName: "Industry.UNEMPRT_CY"
                                }
                            ]
                        }, {
                            DisplayTitle: "Demographic Information",

                            DisplayFields: [
                                {
                                    DisplayText: "Dominant Tapestry Segment",
                                    FieldName: "Policy.TSEGNAME"
                                }, {
                                    DisplayText: "Labor Force Participation Rate",
                                    FieldName: "Industry.CIVLBFR_CY"
                                },
                                {
                                    DisplayText: "Total Population",
                                    FieldName: "KeyUSFacts.TOTPOP_CY"
                                }, {
                                    DisplayText: "Total Households",
                                    FieldName: "KeyUSFacts.TOTHH_CY"
                                }, {
                                    DisplayText: "Average Household Size",
                                    FieldName: "KeyUSFacts.AVGHHSZ_CY"
                                }, {
                                    DisplayText: "Average Household Income",
                                    FieldName: "KeyUSFacts.AVGHINC_CY"
                                }, {
                                    DisplayText: "Median Household Income",
                                    FieldName: "KeyUSFacts.MEDHINC_CY"
                                }, {
                                    DisplayText: "Per Capita Income",
                                    FieldName: "KeyUSFacts.PCI_CY"
                                }, {
                                    DisplayText: "Total Housing Units",
                                    FieldName: "KeyUSFacts.TOTHU_FY"
                                }, {
                                    DisplayText: "Owner Occupied HUs",
                                    FieldName: "KeyUSFacts.OWNER_CY"
                                }, {
                                    DisplayText: "Renter Occupied HUs",
                                    FieldName: "KeyUSFacts.RENTER_CY"
                                }, {
                                    DisplayText: "Vacant Housing Units",
                                    FieldName: "KeyUSFacts.VACANT_CY"
                                }, {
                                    DisplayText: "Median Home Value",
                                    FieldName: "KeyUSFacts.MEDVAL_CY"
                                }, {
                                    DisplayText: "Average Home Value",
                                    FieldName: "KeyUSFacts.AVGVAL_CY"
                                }
                            ]
                        }
                    ],
                    DownloadSettings: [
                        {
                            DisplayOptionTitle: "Business Summary",
                            GeoEnrichmentReportName: "business_summary",
                            Filetype: "PDF" //allowed PDF or XLSX
                        }, {
                            DisplayOptionTitle: "Demographic and Income Profile",
                            GeoEnrichmentReportName: "dandi",
                            Filetype: "PDF" //allowed PDF or XLSX
                        }
                    ]
                }
            }, {
                Name: "Communities",
                Enabled: false,
                EnableSearch: true,
                EnableDropdown: true,
                FilterSettings: {
                    StandardGeographyQuery: {
                        LocatorDefaultAddress: "Naperville",
                        QueryField: "geographyQuery",
                        SourceCountry: "US",
                        FeatureLimit: 10
                    },
                    FilterLayer: {
                        Title: "EconomicDevelopment - Municipalities",
                        QueryLayerId: "54",
                        FilterFieldName: "COUNTY",
                        OutFields: ["COUNTY"]
                    },
                    InfoPanelSettings: {
                        GeoEnrichmentContents: {
                            DisplayTitle: "Community Information",

                            DisplayFields: [
                                {
                                    DisplayText: "Dominant Tapestry Segment",
                                    FieldName: "Policy.TSEGNAME"
                                }, {
                                    DisplayText: "Labor Force Participation Rate",
                                    FieldName: "Industry.CIVLBFR_CY"
                                },
                                {
                                    DisplayText: "Total Population",
                                    FieldName: "KeyUSFacts.TOTPOP_CY"
                                }, {
                                    DisplayText: "Total Households",
                                    FieldName: "KeyUSFacts.TOTHH_CY"
                                }, {
                                    DisplayText: "Average Household Size",
                                    FieldName: "KeyUSFacts.AVGHHSZ_CY"
                                }, {
                                    DisplayText: "Average Household Income",
                                    FieldName: "KeyUSFacts.AVGHINC_CY"
                                }, {
                                    DisplayText: "Median Household Income",
                                    FieldName: "KeyUSFacts.MEDHINC_CY"
                                }, {
                                    DisplayText: "Per Capita Income",
                                    FieldName: "KeyUSFacts.PCI_CY"
                                }, {
                                    DisplayText: "Total Housing Units",
                                    FieldName: "KeyUSFacts.TOTHU_FY"
                                }, {
                                    DisplayText: "Owner Occupied HUs",
                                    FieldName: "KeyUSFacts.OWNER_CY"
                                }, {
                                    DisplayText: "Renter Occupied HUs",
                                    FieldName: "KeyUSFacts.RENTER_CY"
                                }, {
                                    DisplayText: "Vacant Housing Units",
                                    FieldName: "KeyUSFacts.VACANT_CY"
                                }, {
                                    DisplayText: "Median Home Value",
                                    FieldName: "KeyUSFacts.MEDVAL_CY"
                                }, {
                                    DisplayText: "Average Home Value",
                                    FieldName: "KeyUSFacts.AVGVAL_CY"
                                }
                            ]
                        },
                        DownloadSettings: [{
                            DisplayOptionTitle: "Community Profile",
                            GeoEnrichmentReportName: "community_profile",
                            Filetype: "PDF" //allowed PDF or XLSX
                        }, {
                            DisplayOptionTitle: "Demographic and Income Profile",
                            GeoEnrichmentReportName: "dandi",
                            Filetype: "PDF" //allowed PDF or XLSX
                        }]
                    }
                }
            }],
        // ------------------------------------------------------------------------------------------------------------------------
        // ADDRESS SEARCH SETTINGS
        // ------------------------------------------------------------------------------------------------------------------------
        // Set locator settings such as locator symbol, size, display fields, match score
        // LocatorParameters: Parameters(text, outFields, maxLocations, bbox, outSR) used for address and location search.
        // AddressSearch: Candidates based on which the address search will be performed.
        // AddressMatchScore: Setting the minimum score for filtering the candidate results.
        // MaxResults: Maximum number of locations to display in the results menu.
        LocatorSettings: {
            LocatorFilterFieldName: "Addr_Type",
            LocatorFilterFieldValues: ['PointAddress', 'BuildingName', 'StreetAddress', 'StreetInt', 'StreetName', 'Postal', 'POI', 'Locality'],
            DefaultLocatorSymbol: "/js/library/themes/images/redpushpin.png",
            MarkupSymbolSize: {
                width: 35,
                height: 35
            },
            DisplayText: "Address",
            LocatorDefaultAddress: "1215 Hidden Springs, Naperville, Illinois, 60540",
            LocatorParameters: {
                SearchField: "SingleLine",
                SearchBoundaryField: "searchExtent"
            },
            LocatorURL: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer",
            LocatorOutFields: ["Addr_Type", "Type", "Score", "Match_Addr", "xmin", "xmax", "ymin", "ymax"],
            DisplayField: "${Match_Addr}",
            AddressMatchScore: {
                Field: "Score",
                Value: 80
            },
            MaxResults: 100
        },

        // ------------------------------------------------------------------------------------------------------------------------
        // SETTINGS FOR MAP SHARING
        // ------------------------------------------------------------------------------------------------------------------------

        // Set URL for TinyURL service, and URLs for social media
        MapSharingOptions: {
            TinyURLServiceURL: "https://api-ssl.bitly.com/v3/shorten?longUrl=${0}",
            TinyURLResponseAttribute: "data.url",
            FacebookShareURL: "http://www.facebook.com/sharer.php?u=${0}&t=Site%20Selector",
            TwitterShareURL: "http://mobile.twitter.com/compose/tweet?status=Site%20Selector ${0}",
            ShareByMailLink: "mailto:%20?subject=Check%20out%20this%20map!&body=${0}"
        },

        //------------------------------------------------------------------------------------------------------------------------
        // Header Widget Settings
        //------------------------------------------------------------------------------------------------------------------------
        // Set widgets settings such as widget title, widgetPath, mapInstanceRequired to be displayed in header panel
        // WidgetPath: path of the widget respective to the widgets package.

        AppHeaderWidgets: [
            {
                WidgetPath: "widgets/siteLocator/siteLocator"
            }, {
                WidgetPath: "widgets/geoLocation/geoLocation"
            }, {
                WidgetPath: "widgets/share/share"
            }, {
                WidgetPath: "widgets/help/help"
            }
        ]

    };
});