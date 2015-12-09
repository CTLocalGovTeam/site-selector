/*global define,dojo,dojoConfig,esri,esriConfig,alert,console,handle:true,dijit,appGlobals */
/*jslint browser:true,sloppy:true,nomen:true,unparam:true,plusplus:true,indent:4 */
/** @license
 | Copyright 2013 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
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
//============================================================================================================================//
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/i18n!application/js/library/nls/localizedStrings",
    "dojo/number",
    "dojo/on",
    "dojo/topic",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetBase",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Select",
    "esri/geometry/Polygon",
    "esri/request",
    "esri/tasks/GeometryService",
    "esri/tasks/Geoprocessor",
    "esri/tasks/PrintTask",
    "esri/tasks/query",
    "esri/tasks/QueryTask",
    "esri/tasks/RelationParameters"
], function (array, declare, lang, domAttr, domClass, domConstruct, domStyle, sharedNls, number, on, topic, _TemplatedMixin, _WidgetBase, _WidgetsInTemplateMixin, SelectList, Polygon, esriRequest, GeometryService, Geoprocessor, PrintTask, Query, QueryTask, RelationParameters) {
    //========================================================================================================================//

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        /**
        * geometry query on drop down selection of communities tab
        * @param {object} selected value from drop down
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _selectionChangeForCommunities: function (value) {
            var queryCommunities, queryTaskCommunities;
            appGlobals.shareOptions.communitySelectionFeature = value;
            queryTaskCommunities = new QueryTask(appGlobals.configData.Workflows[3].FilterSettings.FilterLayer.LayerURL);
            queryCommunities = new Query();
            queryCommunities.where = appGlobals.configData.Workflows[3].FilterSettings.FilterLayer.FilterFieldName + "='" + value + "'";
            queryCommunities.returnGeometry = true;
            //execute query on Communities
            queryTaskCommunities.execute(queryCommunities, lang.hitch(this, this._geometryForSelectedArea));
        },

        /**
        * show available polygon feature from layer perform sorting
        * @param {object} feature set from layer
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _showResultsearchCommunitySelectNames: function (featureSet) {
            var i, resultFeatures = featureSet.features, areaListOptions = [];
            for (i = 0; i < resultFeatures.length; i++) {
                if (resultFeatures[i].attributes[appGlobals.configData.Workflows[3].FilterSettings.FilterLayer.FilterFieldName] !== " ") {
                    areaListOptions.push({ "label": resultFeatures[i].attributes[appGlobals.configData.Workflows[3].FilterSettings.FilterLayer.FilterFieldName], "value": resultFeatures[i].attributes[appGlobals.configData.Workflows[3].FilterSettings.FilterLayer.FilterFieldName] });
                }
            }
            areaListOptions.sort(function (a, b) {
                if (a.label < b.label) {
                    return -1;
                }
                if (a.label > b.label) {
                    return 1;
                }
                return 0;
            });
            areaListOptions.splice(0, 0, { "label": sharedNls.titles.select, "value": sharedNls.titles.select });
            this.comAreaList = new SelectList({
                options: areaListOptions,
                "id": "areaList"
            }, this.searchContainerComm);

            if (window.location.toString().split("$communitySelectionFeature=").length > 1) {
                this.comAreaList.disabled = false;
                this.comAreaList.set("displayedValue", decodeURIComponent(window.location.toString()).split("$communitySelectionFeature=")[1].split("$")[0]);
            } else {
                this.comAreaList.disabled = "disabled";
            }

            this.own(on(this.comAreaList, "change", lang.hitch(this, function (value) {
                if (value.toLowerCase() !== sharedNls.titles.select.toLowerCase()) {
                    this._selectionChangeForCommunities(value);
                    if (document.activeElement) {
                        document.activeElement.blur();
                    }
                    topic.publish("showProgressIndicator");
                }
            })));
        },

        /**
        * display business tab in business workflow
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _showBusinessTab: function () {
            if (domStyle.get(this.demographicContainer, "display") === "block") {
                domStyle.set(this.demographicContainer, "display", "none");
                domStyle.set(this.businessContainer, "display", "block");
                domClass.replace(this.ResultBusinessTab, "esriCTBusinessInfoTabSelected", "esriCTAreaOfInterestTab");
                domClass.replace(this.businessContainer, "esriCTShowContainerHeight", "esriCTHideContainerHeight");
                domClass.replace(this.resultDemographicTab, "esriCTDemographicInfoTabSelected", "esriCTReportTab");
            }
        },

        /**
        * display demography tab, call geoenrichment service for demographic information in business workflow
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _showDemographicInfoTab: function () {
            if (domStyle.get(this.demographicContainer, "display") === "none") {
                domStyle.set(this.demographicContainer, "display", "block");
                domStyle.set(this.businessContainer, "display", "none");
                domClass.replace(this.ResultBusinessTab, "esriCTAreaOfInterestTab", "esriCTBusinessInfoTabSelected");
                domClass.replace(this.resultDemographicTab, "esriCTReportTab", "esriCTDemographicInfoTabSelected");
                // checking the workflow count for business workflow
                if ((!domClass.contains(this.demographicContainer, "esriCTDemographicInfoTabSelected")) && ((this._previousBufferBuildingValue !== appGlobals.shareOptions.arrBufferDistance[this.workflowCount]) || (this._previousAddrValue !== appGlobals.shareOptions.arrStrAdderss[this.workflowCount]))) {
                    topic.publish("showProgressIndicator");
                    this._previousBufferBuildingValue = appGlobals.shareOptions.arrBufferDistance[this.workflowCount];
                    this._previousAddrValue = appGlobals.shareOptions.arrStrAdderss[this.workflowCount];
                    this._enrichDataRequest(this.lastGeometry[this.workflowCount], this.workflowCount, null);
                }
            }
        },


        /**
        * validate the numeric text box control
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _fromToDatachangeHandler: function () {
            var node, checkBox, arrayFeatures, hasValidValues = true;
            for (node in this.filterOptionsValues) {
                if (this.filterOptionsValues.hasOwnProperty(node)) {
                    // check the selected filters and workflow value
                    if (this.filterOptionsValues[node].workflow === 2) {
                        checkBox = this.filterOptionsValues[node].checkBox;
                        if (checkBox.checked && hasValidValues) {
                            hasValidValues = this._validateBusinessFromToValues(this.filterOptionsValues[node].txtFrom.value, this.filterOptionsValues[node].txtTo.value, checkBox);
                            if (!hasValidValues) {
                                for (node in this.filterOptionsValues) {
                                    if (this.filterOptionsValues.hasOwnProperty(node)) {
                                        if (this.filterOptionsValues[node].workflow === this.workflowCount) {
                                            if (this.filterOptionsValues[node].txtFrom && this.filterOptionsValues[node].txtTo) {
                                                // clear from and to value text boxes in business tab
                                                this.filterOptionsValues[node].txtFrom.value = "";
                                                this.filterOptionsValues[node].txtTo.value = "";
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }
            }
            // if filters are valid then do query on filters and get the filtered data
            if (hasValidValues) {
                arrayFeatures = this._checkForValue();
                this._calculateSum(arrayFeatures);
                this._setBusinessValues(arrayFeatures, this.mainResultDiv, this.enrichData, true);
            } else {
                // reset previous buffer value and buffer state
                this._resetBusinessBufferValueResult();
                alert(sharedNls.errorMessages.invalidInput);
                topic.publish("hideProgressIndicator");
            }
            //enable the clear filter button when filter button is clicked
            domClass.add(this.clearFilterBusiness, "esriCTClearFilterIconEnable");
        },

        /**
        * clear filter icon click clear all filter and get buffer result in business tab
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        clearFilterBusinessClick: function () {
            this.own(on(this.clearFilterBusiness, "click", lang.hitch(this, function () {
                if (domClass.contains(this.clearFilterBusiness, "esriCTClearFilterIconEnable")) {
                    topic.publish("showProgressIndicator");
                    // reset previous buffer value and buffer state
                    this._resetBusinessBufferValueResult();
                    // clear selected filter checkbox in business tab
                    this._clearFilterCheckBoxes();
                    domClass.remove(this.filterIconBusiness, "esriCTFilterEnabled");
                    domClass.remove(this.clearFilterBusiness, "esriCTClearFilterIconEnable");
                    appGlobals.shareOptions.toFromBussinessFilter = null;
                }
            })));
        },

        /**
        * display buffer result when no filter is applied
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _resetBusinessBufferValueResult: function () {
            this._calculateSum(this.businessData);
            this._setBusinessValues(this.businessData, this.mainResultDiv, this.enrichData);
            topic.publish("hideProgressIndicator");
        },

        /**
        * check the filter values, if valid, set the data in sharing variable
        * @param {object} fromValue
        * @param {object} toValue
        * @param {object} checkBox
        * @return {boolean} hasValidValues
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _validateBusinessFromToValues: function (fromValue, toValue, checkBox) {
            var arrFilter, hasValidValues, i;
            if (!isNaN(Number(fromValue)) && !isNaN(Number(toValue)) && Number(fromValue) >= 0 && Number(toValue) >= 0 && Number(toValue) >= Number(fromValue) && fromValue !== "" && toValue !== "") {
                if (!appGlobals.shareOptions.toFromBussinessFilter) {
                    appGlobals.shareOptions.toFromBussinessFilter = checkBox.value + "," + fromValue + "," + toValue;
                } else {
                    arrFilter = appGlobals.shareOptions.toFromBussinessFilter.split("$");
                    for (i = 0; i < arrFilter.length; i++) {
                        if (arrFilter[i].toString().split(checkBox.value).length > 1) {
                            arrFilter.splice(i, 1);
                        }
                    }
                    if (arrFilter.length > 0) {
                        appGlobals.shareOptions.toFromBussinessFilter = arrFilter.join("$");
                        appGlobals.shareOptions.toFromBussinessFilter += "$" + checkBox.value + "," + fromValue + "," + toValue;
                    } else {
                        appGlobals.shareOptions.toFromBussinessFilter = checkBox.value + "," + fromValue + "," + toValue;
                    }
                }
                hasValidValues = true;
            } else {
                if (appGlobals.shareOptions.toFromBussinessFilter) {
                    arrFilter = appGlobals.shareOptions.toFromBussinessFilter.split("$");
                    for (i = 0; i < arrFilter.length; i++) {
                        if (arrFilter[i].toString().split(checkBox.value).length > 1) {
                            arrFilter.splice(i, 1);
                        }
                    }
                }
                hasValidValues = false;
            }
            return hasValidValues;
        },

        /**
        * apply the filter to result data and create filtered data set
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _checkForValue: function () {
            var resultData = [], i, isvalid = false, salesFromValue, salesCheckBox, empFromValue, empCheckBox, fieldValue, salesToValue, empToValue;
            if (this.filterOptionsValues._SALES) {
                salesFromValue = this.filterOptionsValues._SALES.txtFrom.value;
                salesToValue = this.filterOptionsValues._SALES.txtTo.value;
                salesCheckBox = this.filterOptionsValues._SALES.checkBox;
            }
            if (this.filterOptionsValues._EMP) {
                empFromValue = this.filterOptionsValues._EMP.txtFrom.value;
                empToValue = this.filterOptionsValues._EMP.txtTo.value;
                empCheckBox = this.filterOptionsValues._EMP.checkBox;
            }

            if (this.totalArray.length) {
                for (i = 0; i < this.totalArray.length; i++) {
                    isvalid = true;
                    if ((salesCheckBox && salesCheckBox.checked) && (salesFromValue || salesFromValue === 0) && (salesToValue || salesToValue === 0)) {
                        isvalid = false;
                        fieldValue = this.totalArray[i].Revenue.Value;
                        if (fieldValue >= parseInt(salesFromValue, 10) && fieldValue <= parseInt(salesToValue, 10)) {
                            isvalid = true;
                        }
                    }
                    if ((empCheckBox && empCheckBox.checked) && (empFromValue || empFromValue === 0) && (empToValue || empToValue === 0)) {
                        if (isvalid) {
                            isvalid = false;
                            fieldValue = this.totalArray[i].Employe.Value;
                            if (fieldValue >= parseInt(empFromValue, 10) && fieldValue <= parseInt(empToValue, 10)) {
                                isvalid = true;
                            }
                        }
                    }
                    if (isvalid) {
                        resultData.push({ DisplayField: this.totalArray[i].Bus.DisplayField, Count: this.totalArray[i].Bus.Value, Revenue: this.totalArray[i].Revenue.Value, Employees: this.totalArray[i].Employe.Value });
                    }

                }
            }
            return resultData;
        },

        /**
        * Perform spatial analysis to check if geometry for enrichment is intersected by web map extent
        * @param {object} Geometry used to perform enrichment analysis
        * @param {Number} Count of tab(workflow)
        * @param {object} parameter for standard search
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _enrichData: function (geometry, workflowCount, standardSearchCandidate) {
            var geometryService, relationParams, standardGeoQueryURL, standardGeoQueryRequest;
            // if enrich data contain geometry call show buffer function
            if (geometry) {
                // check for business workflow
                if (workflowCount === 2) {
                    this._clearBusinessData();
                    this.showBuffer(geometry);
                }
                // initialize geometry service and set parameter of geometry service
                geometryService = new GeometryService(appGlobals.configData.GeometryService.toString());
                relationParams = new RelationParameters();
                relationParams.relation = RelationParameters.SPATIAL_REL_INTERSECTION;
                relationParams.geometries1 = geometry;
                relationParams.geometries2 = [appGlobals.shareOptions.webMapExtent];
                geometryService.relation(relationParams).then(lang.hitch(this, function (obj) {
                    if (obj.length > 0) {
                        this._enrichDataRequest(geometry, workflowCount, standardSearchCandidate);
                    } else {
                        topic.publish("hideProgressIndicator");
                        this._clearCommunitiesAndBusinessResults(workflowCount);
                        alert(sharedNls.errorMessages.geometryIntersectError);
                        if (workflowCount === 2) {
                            this._clearFilterCheckBoxes();
                            appGlobals.shareOptions.toFromBussinessFilter = null;
                            domStyle.set(this.filterContainerBussiness, "display", "none");
                            domStyle.set(this.filterContainer, "display", "none");
                            domClass.remove(this.filterIconBusiness, "esriCTFilterEnabled");
                            domClass.remove(this.clearFilterBusiness, "esriCTClearFilterIconEnable");
                            domClass.remove(this.filterTextBusiness, "esriCTFilterTextEnable");
                            domClass.add(this.filterMainContainerBussiness, "esriCTFilterMainContainer");
                        }
                    }
                }), function () {
                    topic.publish("hideProgressIndicator");
                    this._clearCommunitiesAndBusinessResults(workflowCount);
                    alert(sharedNls.errorMessages.geometryIntersectError);
                    if (workflowCount === 2) {
                        appGlobals.shareOptions.toFromBussinessFilter = null;
                        domStyle.set(this.filterContainerBussiness, "display", "none");
                        domStyle.set(this.filterContainer, "display", "none");
                        domClass.remove(this.filterIconBusiness, "esriCTFilterEnabled");
                        domClass.remove(this.clearFilterBusiness, "esriCTClearFilterIconEnable");
                        domClass.remove(this.filterTextBusiness, "esriCTFilterTextEnable");
                        domClass.add(this.filterMainContainerBussiness, "esriCTFilterMainContainer");
                    }
                });
            } else {
                // perform standard geographic query for communities tab
                appGlobals.shareOptions.standardGeoQueryAttribute = standardSearchCandidate.attributes.CountryAbbr + "," + standardSearchCandidate.attributes.DataLayerID + "," + standardSearchCandidate.attributes.AreaID;
                standardGeoQueryURL = appGlobals.configData.GeoEnrichmentService + "/StandardGeographyQuery/execute";
                standardGeoQueryRequest = esriRequest({
                    url: standardGeoQueryURL,
                    content: {
                        f: "pjson",
                        outSR: this.map.spatialReference.wkid,
                        sourceCountry: standardSearchCandidate.attributes.CountryAbbr,
                        geographylayers: standardSearchCandidate.attributes.DataLayerID,
                        geographyids: [standardSearchCandidate.attributes.AreaID],
                        returnGeometry: true
                    },
                    handleAs: "json"
                });
                standardGeoQueryRequest.then(lang.hitch(this, function (data) {
                    var geometryPoly = new Polygon();
                    if (data.results && data.results[0] && data.results[0].value && data.results[0].value.features[0] && data.results[0].value.features[0].geometry) {
                        geometryPoly.rings = data.results[0].value.features[0].geometry.rings;
                        geometryPoly.setSpatialReference(this.map.spatialReference);
                        this.lastGeometry[this.workflowCount] = [geometryPoly];
                        this.map.getLayer("esriGraphicsLayerMapSettings").clear();
                        this.showBuffer([geometryPoly]);
                        this._enrichData([geometryPoly], workflowCount, null);
                    } else {
                        topic.publish("hideProgressIndicator");
                        alert(sharedNls.errorMessages.invalidSearch);
                    }
                }), function (error) {
                    topic.publish("hideProgressIndicator");
                    alert(error.message);
                });
            }

        },

        /**
        * clear info Panel for Communities and Business Tab
        * @param {Number} index of current tab(workflow)
        * @memberOf widgets/siteLocator/geoEnrichment
        */

        _clearCommunitiesAndBusinessResults: function (workflowCount) {
            if (workflowCount === 2) {
                domStyle.set(this.divBusinessResult, "display", "none");
                domStyle.set(this.sortByDiv, "display", "none");
                domStyle.set(this.downloadDiv, "display", "none");
                domStyle.set(this.resultDiv, "display", "none");
            } else {
                domConstruct.empty(this.communityMainDiv);
                appGlobals.shareOptions.communitySelectionFeature = null;
            }
        },

        /**
        * perform data enrichment based on parameters, calling geoenrichment service, setting analysis variables on the basis of workflow count and call geoenrichment handler
        * @param {object} geometry used to perform enrichment analysis
        * @param {Number} count of tab(workflow)
        * @param {object} parameter for standard search
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _enrichDataRequest: function (geometry, workflowCount, standardSearchCandidate) {
            var studyAreas, requestContent, enrichUrl, geoEnrichmentRequest, dataCollections, analysisVariables, i, isRetunrnGeometry = true, params = {};
            try {
                // set the study areas for Building, Sites and Business workflow
                if (geometry !== null && workflowCount !== 3) {
                    studyAreas = [{ "geometry": { "rings": geometry[0].rings, "spatialReference": { "wkid": this.map.spatialReference.wkid} }, "attributes": { "id": "Polygon 1", "name": "Optional Name 1"}}];
                    this.arrStudyAreas[this.workflowCount] = studyAreas;
                }
                enrichUrl = appGlobals.configData.GeoEnrichmentService + "/GeoEnrichment/enrich";
                // check Workflow count for all workflows
                switch (workflowCount) {
                case 0:
                    //set the analysis variables for Building workflow
                    analysisVariables = this._setAnalysisVariables(appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents.DisplayFields);
                    if (this.arrGeoenrichData[this.workflowCount][0].ID) {
                        params.objectIds = [this.arrGeoenrichData[this.workflowCount][0].ID];
                    }
                    params = {
                        "f": "pjson",
                        "inSR": this.map.spatialReference.wkid,
                        "outSR": this.map.spatialReference.wkid,
                        "analysisVariables": JSON.stringify(analysisVariables.analysisVariable),
                        "studyAreas": JSON.stringify(studyAreas)
                    };
                    geoEnrichmentRequest = esriRequest({
                        url: enrichUrl,
                        content: params,
                        handleAs: "json"
                    });
                    break;
                case 1:
                    //set the analysis variables for Sites workflow
                    analysisVariables = this._setAnalysisVariables(appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents.DisplayFields);
                    if (this.arrGeoenrichData[this.workflowCount][0].ID) {
                        params.objectIds = [this.arrGeoenrichData[this.workflowCount][0].ID];
                    }
                    params = {
                        "f": "pjson",
                        "inSR": this.map.spatialReference.wkid,
                        "outSR": this.map.spatialReference.wkid,
                        "analysisVariables": JSON.stringify(analysisVariables.analysisVariable),
                        "studyAreas": JSON.stringify(studyAreas)
                    };
                    geoEnrichmentRequest = esriRequest({
                        url: enrichUrl,
                        content: params,
                        handleAs: "json"
                    });
                    break;
                case 2:
                    //checking whether demographic results exists and setting analysis variables for Demographic tab in Business workflow
                    if (!domClass.contains(this.ResultBusinessTab, "esriCTBusinessInfoTabSelected")) {
                        analysisVariables = this._setAnalysisVariables(appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents[1].DisplayFields);
                        requestContent = {
                            f: "pjson",
                            inSR: this.map.spatialReference.wkid,
                            outSR: this.map.spatialReference.wkid,
                            analysisVariables: JSON.stringify(analysisVariables.analysisVariable),
                            studyAreas: JSON.stringify(studyAreas)
                        };
                    } else {
                        //set analysis variables for business tab in business workflow
                        analysisVariables = {};
                        analysisVariables.analysisVariable = [];
                        for (i = 0; i < appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields.length; i++) {
                            if (appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[i].FieldName) {
                                analysisVariables.analysisVariable.push(appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[i].FieldName);
                            }
                        }
                        dataCollections = appGlobals.configData.Workflows[workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessDataCollectionName;
                        requestContent = {
                            f: "pjson",
                            inSR: this.map.spatialReference.wkid,
                            outSR: this.map.spatialReference.wkid,
                            dataCollections: JSON.stringify(dataCollections),
                            analysisVariables: JSON.stringify(analysisVariables.analysisVariable),
                            studyAreas: JSON.stringify(studyAreas)
                        };
                    }
                    geoEnrichmentRequest = esriRequest({
                        url: enrichUrl,
                        content: requestContent,
                        handleAs: "json"
                    });
                    break;
                case 3:
                    // setting analysis variables for Communities Tab
                    // if geometry is equal to null then set the study areas for Communities Tab
                    if (geometry === null) {
                        studyAreas = [{ "sourceCountry": standardSearchCandidate.attributes.CountryAbbr, "layer": standardSearchCandidate.attributes.DataLayerID, "ids": [standardSearchCandidate.attributes.AreaID]}];
                        this.arrStudyAreas[this.workflowCount] = studyAreas;
                        this.map.getLayer("esriGraphicsLayerMapSettings").clear();
                        this.featureGeometry[this.workflowCount] = null;
                    } else if (geometry[0].type === "polygon") {
                        isRetunrnGeometry = false;
                        this.lastGeometry[this.workflowCount] = geometry;
                        this.map.getLayer("esriGraphicsLayerMapSettings").clear();
                        this.featureGeometry[this.workflowCount] = null;
                        this.showBuffer(geometry);
                        studyAreas = [{ "geometry": { "rings": geometry[0].rings, "spatialReference": { "wkid": this.map.spatialReference.wkid} }, "attributes": { "id": "Polygon 1", "name": "Optional Name 1"}}];
                        this.arrStudyAreas[this.workflowCount] = studyAreas;
                    } else {
                        studyAreas = [{ "geometry": { "x": geometry[0].x, "y": geometry[0].y }, "spatialReference": { "wkid": this.map.spatialReference.wkid}}];
                        this.arrStudyAreas[this.workflowCount] = studyAreas;
                    }
                    analysisVariables = this._setAnalysisVariables(appGlobals.configData.Workflows[workflowCount].FilterSettings.InfoPanelSettings.GeoEnrichmentContents.DisplayFields);
                    geoEnrichmentRequest = esriRequest({
                        url: enrichUrl,
                        content: {
                            f: "pjson",
                            inSR: this.map.spatialReference.wkid,
                            outSR: this.map.spatialReference.wkid,
                            analysisVariables: JSON.stringify(analysisVariables.analysisVariable),
                            studyAreas: JSON.stringify(studyAreas),
                            returnGeometry: isRetunrnGeometry
                        },
                        handleAs: "json"
                    });
                    break;
                }

                /**
                * geoenrichment result handler
                * @param {object} result data for geoenrichment request
                * @memberOf widgets/siteLocator/geoEnrichment
                */
                geoEnrichmentRequest.then(lang.hitch(this, this._geoEnrichmentRequestHandler),
                    function (error) {
                        topic.publish("hideProgressIndicator");
                        alert(error.message);
                    }
                        );
            } catch (Error) {
                topic.publish("hideProgressIndicator");
            }

        },

        /**
        * geoenrichment result handler
        * @param {object} result data for geoenrichment request
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _geoEnrichmentRequestHandler: function (data, id) {
            topic.publish("hideProgressIndicator");
            var headerInfo, enrichGeo, attachMentNode, geometryService, geoenrichtOuterDiv, geoenrichtOuterDivContent;
            if (!id && this.arrGeoenrichData[this.workflowCount]) {
                this.arrGeoenrichData[this.workflowCount][this.arrGeoenrichData[this.workflowCount].length - 1].data = data;
            }
            // set attachment images for buildings and sites tab after clicking the features of building and sites Tab
            if ((this.workflowCount === 0 || this.workflowCount === 1) && data) {
                if (this.workflowCount === 0) {
                    attachMentNode = this.attachmentOuterDiv;
                } else {
                    attachMentNode = this.attachmentOuterDivSites;
                }
                domConstruct.create("div", { "class": "esriCTHorizantalLine" }, attachMentNode);
                headerInfo = domConstruct.create("div", { "class": "esriCTHeaderInfoDiv" }, attachMentNode);
                domAttr.set(headerInfo, "innerHTML", appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents.DisplayTitle);
                geoenrichtOuterDiv = domConstruct.create("div", { "class": "esriCTDemoInfoMainDiv" }, attachMentNode);
                geoenrichtOuterDivContent = domConstruct.create("div", {}, geoenrichtOuterDiv);
                this._getDemographyResult(data, appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents, geoenrichtOuterDivContent);
            }
            if (this.workflowCount === 2) {
                this.ResultBusinessTabTitle.innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].DisplayTitle;
                this.ResultDemographicTabTitle.innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[1].DisplayTitle;
                this.demographicContainerTitle.innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[1].DisplayTitle;
                domStyle.set(this.resultDiv, "display", "block");
                // if business results are available then call the get demographic result handler(set demographic data result) in business workflow
                if (!domClass.contains(this.ResultBusinessTab, "esriCTBusinessInfoTabSelected")) {
                    this._getDemographyResult(data, appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[1], this.DemoInfoMainDivContent);
                } else {
                    // set the business data in business workflow
                    this._setResultData(data);
                }
            }
            if (this.workflowCount === 3) {
                if (data.results[0].value.FeatureSet[0].features.length > 0) {
                    this.featureGraphics[this.workflowCount] = null;
                    if (data.results[0].value.FeatureSet[0].features[0].geometry) {
                        topic.publish("showProgressIndicator");
                        enrichGeo = new Polygon(data.results[0].value.FeatureSet[0].features[0].geometry);
                        enrichGeo.spatialReference = this.map.spatialReference;
                        geometryService = new GeometryService(appGlobals.configData.GeometryService.toString());
                        geometryService.intersect([enrichGeo], appGlobals.shareOptions.webMapExtent, lang.hitch(this, function (interSectGeometry) {
                            topic.publish("hideProgressIndicator");
                            this.lastGeometry[this.workflowCount] = [enrichGeo];
                            this.showBuffer([enrichGeo]);
                            if (interSectGeometry[0].rings.length > 0) {
                                this._setComunitiesEnrichData(data);
                            } else {
                                alert(sharedNls.errorMessages.geometryIntersectError);
                            }
                        }), lang.hitch(this, function () {
                            topic.publish("hideProgressIndicator");
                            alert(sharedNls.errorMessages.geometryIntersectError);
                        }));
                    } else {
                        this._setComunitiesEnrichData(data);
                    }
                } else {
                    this.map.graphics.clear();
                    this.map.getLayer("esriBufferGraphicsLayer").clear();
                    alert(sharedNls.errorMessages.invalidSearch);
                }
            }
        },

        /**
        * set Geoenrichment data for communities tab
        * @param {object} geoenrichment result data
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _setComunitiesEnrichData: function (data) {
            var geoenrichtOuterDiv, geoenrichtOuterDivContent;
            domConstruct.empty(this.communityMainDiv);
            domConstruct.create("div", { "class": "esriCTCommunityTitleDiv", "innerHTML": appGlobals.configData.Workflows[this.workflowCount].FilterSettings.InfoPanelSettings.GeoEnrichmentContents.DisplayTitle }, this.communityMainDiv);
            this._downloadDropDown(appGlobals.configData.Workflows[this.workflowCount].FilterSettings.InfoPanelSettings.DownloadSettings, this.communityMainDiv);
            geoenrichtOuterDiv = domConstruct.create("div", { "class": "esriCTDemoInfoMainDiv" }, this.communityMainDiv);
            geoenrichtOuterDivContent = domConstruct.create("div", {}, geoenrichtOuterDiv);
            this._getDemographyResult(data, appGlobals.configData.Workflows[this.workflowCount].FilterSettings.InfoPanelSettings.GeoEnrichmentContents, geoenrichtOuterDivContent);
        },

        /**
        * set analysis variable for geoenrichment
        * @param {array} field configured in config.js for geoenrichment variables
        * @return {Collection} geoenrichment variable for display field
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _setAnalysisVariables: function (arrDisplayFields) {
            var arrStringFields = [], strDisplayFields = [], i;
            for (i = 0; i < arrDisplayFields.length; i++) {
                strDisplayFields.push(arrDisplayFields[i].DisplayText);
                arrStringFields.push(arrDisplayFields[i].FieldName);
            }
            return { analysisVariable: arrStringFields, displayField: strDisplayFields };
        },

        /**
        * get demographic data from geoenrichment result and add item to specified html node
        * @param {object} geoenrichment result
        * @param {array} field used to denote demographic information
        * @param {object} HTML node on used to display demography data
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _getDemographyResult: function (geoEnrichData, Geoenerichfield, demoNode) {
            var arrDemographyDataCount = 0, fieldKey, i, displayFieldDiv, valueDiv, demographicInfoContent, field = Geoenerichfield.DisplayFields, aarReportData = [];
            domConstruct.empty(demoNode);
            for (i = 0; i < field.length; i++) {
                fieldKey = field[i].FieldName.split(".")[1];
                if (geoEnrichData.results[0].value.FeatureSet[0].features[0].attributes[fieldKey] !== undefined) {
                    arrDemographyDataCount++;
                    demographicInfoContent = domConstruct.create("div", { "class": "esriCTdemographicInfoPanel" }, demoNode);
                    displayFieldDiv = domConstruct.create("div", { "class": "esriCTDemographicCollectionName" }, demographicInfoContent);
                    displayFieldDiv.innerHTML = field[i].DisplayText;
                    valueDiv = domConstruct.create("div", { "class": "esriCTDemographicCollectionValue" }, demographicInfoContent);
                    if (isNaN(geoEnrichData.results[0].value.FeatureSet[0].features[0].attributes[fieldKey])) {
                        valueDiv.innerHTML = geoEnrichData.results[0].value.FeatureSet[0].features[0].attributes[fieldKey];
                        aarReportData.push(field[i].DisplayText + ":" + valueDiv.innerHTML);
                    } else {
                        valueDiv.innerHTML = this._getUnit(geoEnrichData, fieldKey) + number.format(geoEnrichData.results[0].value.FeatureSet[0].features[0].attributes[fieldKey], { places: 0 });
                        aarReportData.push(field[i].DisplayText + ":" + valueDiv.innerHTML);
                    }
                }
            }
            if (this.arrReportDataJson[this.workflowCount]) {
                this.arrReportDataJson[this.workflowCount].reportData[Geoenerichfield.DisplayTitle.toString()] = aarReportData;
            }
            if (arrDemographyDataCount === 0) {

                if (this.workflowCount === 3) {
                    domConstruct.empty(this.communityMainDiv);
                    alert(sharedNls.errorMessages.invalidSearch);
                }
            }
        },

        /**
        * gets units for demography data from geoenrichment result
        * @param {object} geoenrichment result
        * @param {array} field used to denote demography
        * @return {string} unit for collection ids
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _getUnit: function (data, field) {
            var i, strUnit = "";
            for (i = 0; i < data.results[0].value.FeatureSet[0].fields.length; i++) {
                if (data.results[0].value.FeatureSet[0].fields[i].units !== undefined) {
                    if (data.results[0].value.FeatureSet[0].fields[i].name === field) {
                        if (data.results[0].value.FeatureSet[0].fields[i][data.results[0].value.FeatureSet[0].fields[i].units]) {
                            strUnit = data.results[0].value.FeatureSet[0].fields[i][data.results[0].value.FeatureSet[0].fields[i].units];
                            break;
                        }
                    }
                }
            }
            return strUnit;
        },

        /**
        * set geoenrichment result for business tab
        * @param {object} geoenrichment result
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _setResultData: function (enrichData) {
            var arrfiledString = [], value, i, j, k, strFieldName, revenue, employee, bus, key, revenueObject = {}, employeeObject = {}, busObject = {};
            this.arrBussinesResultData = [];
            this.totalArray = [];
            // if result exist then enable the filter icon and filter text
            if (enrichData.results[0].value.FeatureSet[0] && enrichData.results[0].value.FeatureSet[0].features[0].attributes) {
                domClass.add(this.filterTextBusiness, "esriCTFilterTextEnable");
                domStyle.set(this.filterContainerBussiness, "display", "block");
                domClass.add(this.filterContainerBussiness, "esriCTFilterMainContainer");
                domClass.remove(this.filterMainContainerBussiness, "esriCTFilterMainContainer");

            }
            // set geoenrichment business data based on configuration parameter in business tab
            for (i = 0; i < appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields.length; i++) {
                strFieldName = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[i].FieldName.split(".")[1];
                this.divBusinessResult.children[i].children[0].innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[i].DisplayText;
                this.divBusinessResult.children[i].children[1].innerHTML = this._getUnit(enrichData, strFieldName.toString()) + number.format(enrichData.results[0].value.FeatureSet[0].features[0].attributes[strFieldName.toString()], { places: 0 });
                if (appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[i].FieldName.split(".")[0] === appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessDataCollectionName) {
                    arrfiledString.push(strFieldName.toString().split("_"));
                }
            }
            for (value in enrichData.results[0].value.FeatureSet[0].features[0].attributes) {
                if (enrichData.results[0].value.FeatureSet[0].features[0].attributes.hasOwnProperty(value)) {
                    for (j = 0; j < arrfiledString.length; j++) {
                        if (value.indexOf(arrfiledString[j][1].toString()) !== -1) {
                            this.arrBussinesResultData.push({ FieldName: value, Value: enrichData.results[0].value.FeatureSet[0].features[0].attributes[value], DisplayField: enrichData.results[0].value.FeatureSet[0].fieldAliases[value] });
                            break;
                        }
                    }
                }
            }
            for (i = 0; i < this.arrBussinesResultData.length; i++) {
                if (i > 2) {
                    for (j = 0; j < this.arrBussinesResultData.length; j++) {
                        if (this.arrBussinesResultData[i].FieldName.indexOf('N0' + j + "_SALES") > -1 || this.arrBussinesResultData[i].FieldName.indexOf('N' + j + "_SALES") > -1) {
                            revenueObject["N" + j] = this.arrBussinesResultData[i];
                            break;
                        }
                        if (this.arrBussinesResultData[i].FieldName.indexOf('N0' + j + "_EMP") > -1 || this.arrBussinesResultData[i].FieldName.indexOf('N' + j + "_EMP") > -1) {
                            employeeObject["N" + j] = this.arrBussinesResultData[i];
                            break;
                        }
                        if (this.arrBussinesResultData[i].FieldName.indexOf('N0' + j + "_BUS") > -1 || this.arrBussinesResultData[i].FieldName.indexOf('N' + j + "_BUS") > -1) {
                            busObject["N" + j] = this.arrBussinesResultData[i];
                            break;
                        }
                    }
                }
            }
            for (key in revenueObject) {
                if (revenueObject.hasOwnProperty(key)) {
                    revenue = revenueObject[key];
                    employee = employeeObject[key];
                    bus = busObject[key];
                    this.totalArray.push({
                        Revenue: revenue,
                        Employe: employee,
                        Bus: bus
                    });
                }
            }
            this.businessData = [];
            for (k = arrfiledString.length; k < this.arrBussinesResultData.length; k += arrfiledString.length) {
                if (this.arrBussinesResultData[k] && this.arrBussinesResultData[k + 1] && this.arrBussinesResultData[k + 2]) {
                    this.businessData.push({ DisplayField: this.arrBussinesResultData[k].DisplayField, Count: this.arrBussinesResultData[k].Value, Revenue: this.arrBussinesResultData[k + 1].Value, Employees: this.arrBussinesResultData[k + 2].Value });
                }
            }
            this.enrichData = enrichData;
            this.salesFinalData = [];
            this.employeFinalData = [];
            this.revenueData = [];
            domStyle.set(this.divBusinessResult, "display", "none");
            domStyle.set(this.sortByDiv, "display", "none");
            domStyle.set(this.downloadDiv, "display", "none");
            domStyle.set(this.resultDiv, "display", "none");
            if ((this.filterOptionsValues._EMP && this.filterOptionsValues._EMP.checkBox.checked) || (this.filterOptionsValues._SALES && this.filterOptionsValues._SALES.checkBox.checked)) {
                this._fromToDatachangeHandler();
            } else {
                this._calculateSum(this.businessData);
                this._setBusinessValues(this.businessData, this.mainResultDiv, this.enrichData);
            }
        },

        /**
        * set geoenrichment result and add it to specified html node
        * @param {array} aggregated data fromGeoenrichment result
        * @param {object} HTML node to be used to display geoenrichment result
        * @param {object} geoenrichment result
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _setBusinessValues: function (arrData, node, enrichData, notSorted) {
            var i, resultpanel, content, countRevenueEmpPanel, countRevenueEmp, count, countName, countValue, revenue, revenueName, revenuevalue, employee, empName, empValue;
            this._showBusinessTab();
            this.currentBussinessData = arrData;
            // check the shared URL for "strSortingData" to display sorted results in business tab while sharing
            if (window.location.toString().split("$strSortingData=").length > 1 && !this.isSharedSort) {
                this.isSharedSort = true;
                this.selectSortOption.set("value", window.location.toString().split("$strSortingData=")[1].split("$")[0]);
            } else if (notSorted && appGlobals.shareOptions.sortingData) {
                this._selectionChangeForSort(appGlobals.shareOptions.sortingData);
            } else {
                domConstruct.empty(node);
                domConstruct.empty(this.downloadDiv);
                this._downloadDropDown(appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.DownloadSettings, this.downloadDiv);
                if (this.currentBussinessData) {
                    resultpanel = domConstruct.create("div", { "class": "esriCTSortPanelHead" }, node);
                    if (this.currentBussinessData.length !== 0) {
                        domStyle.set(this.divBusinessResult, "display", "block");
                        domStyle.set(this.sortByDiv, "display", "block");
                        domStyle.set(this.downloadDiv, "display", "block");
                        domStyle.set(this.resultDiv, "display", "block");
                        for (i = 0; i < this.currentBussinessData.length; i++) {
                            content = domConstruct.create("div", {}, resultpanel);
                            content.innerHTML = this.currentBussinessData[i].DisplayField;
                            countRevenueEmpPanel = domConstruct.create("div", { "class": "esriCTCountRevenueEmpPanel" }, content);
                            countRevenueEmp = domConstruct.create("div", { "class": "esriCTCountRevenueEmp" }, countRevenueEmpPanel);
                            count = domConstruct.create("div", { "class": "esriCTCount" }, countRevenueEmp);
                            countName = domConstruct.create("div", {}, count);
                            countName.innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].DisplayTextForBusinessCount;
                            countValue = domConstruct.create("div", {}, count);
                            countValue.innerHTML = number.format(this.currentBussinessData[i].Count, { places: 0 });
                            revenue = domConstruct.create("div", { "class": "esriCTRevenue" }, countRevenueEmp);
                            revenueName = domConstruct.create("div", {}, revenue);
                            revenueName.innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[1].DisplayText;
                            revenuevalue = domConstruct.create("div", {}, revenue);
                            revenuevalue.innerHTML = this._getUnit(enrichData, appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[1].FieldName.split(".")[1]) + number.format(this.currentBussinessData[i].Revenue, { places: 0 });
                            employee = domConstruct.create("div", { "class": "esriCTEmployee" }, countRevenueEmp);
                            empName = domConstruct.create("div", { "class": "esriCTNoOfEmployeeHeader" }, employee);
                            empName.innerHTML = appGlobals.configData.Workflows[this.workflowCount].InfoPanelSettings.GeoEnrichmentContents[0].BusinessSummaryFields[2].DisplayText;
                            empValue = domConstruct.create("div", { "class": "esriCTNoOfEmployee" }, employee);
                            empValue.innerHTML = number.format(this.currentBussinessData[i].Employees, { places: 0 });
                        }
                    } else {
                        domStyle.set(this.divBusinessResult, "display", "none");
                        domStyle.set(this.sortByDiv, "display", "none");
                        domStyle.set(this.downloadDiv, "display", "none");
                        domStyle.set(this.resultDiv, "display", "none");
                        appGlobals.shareOptions.sortingData = null;
                        alert(sharedNls.errorMessages.invalidSearch);
                    }
                    topic.publish("hideProgressIndicator");
                }
            }
        },

        /**
        * download drop down for all tab
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _downloadDropDown: function (arrDwnloadDisplayFieldValue, node) {
            var outerDownloadDiv, selectDownloadList, innerDownloadDiv, innerDownloadLabel, selectedValue, sortContentDivDownload, i, selectForDownload, sortingDivDwnload, areaSortBuildingDownload = [];
            // create UI of download dropdown and element content of all tab
            if (this.workflowCount === 2) {
                outerDownloadDiv = domConstruct.create("div", { "class": " esriCTouterDownloadDiv" }, node);
            } else {
                outerDownloadDiv = domConstruct.create("div", { "class": "esriCTouterDownloadDivAttachment" }, node);
            }
            sortingDivDwnload = domConstruct.create("div", { "class": "esriCTInnerSelectBoxDiv" }, outerDownloadDiv);
            innerDownloadDiv = domConstruct.create("div", { "class": "esriCTInnerDownloadDiv" }, outerDownloadDiv);
            innerDownloadLabel = domConstruct.create("label", {}, innerDownloadDiv);
            domAttr.set(innerDownloadLabel, "innerHTML", sharedNls.titles.textDownload);

            sortContentDivDownload = domConstruct.create("div", {}, sortingDivDwnload);
            selectForDownload = domConstruct.create("div", { "class": "esriCTSelect" }, sortContentDivDownload);
            for (i = 0; i < arrDwnloadDisplayFieldValue.length; i++) {
                if (arrDwnloadDisplayFieldValue[i].DisplayOptionTitle) {
                    areaSortBuildingDownload.push({ "label": arrDwnloadDisplayFieldValue[i].DisplayOptionTitle, "value": i.toString() });
                }
            }
            // initialize dijit/form/Select for download
            selectDownloadList = new SelectList({
                options: areaSortBuildingDownload
            }, selectForDownload);
            // attach change event on download dropdown based on selected workflows
            this.own(on(selectDownloadList, "change", lang.hitch(this, function (value) {
                selectedValue = value;
            })));
            selectedValue = 0;
            // attach click event on download button
            this.own(on(innerDownloadDiv, "click", lang.hitch(this, function () {
                var form, postData, fileTypeInput, reportInput, studyAreasInput, gp, params, webMapJsonData, spatialRefernceData, downloadWindow;
                try {
                    if (arrDwnloadDisplayFieldValue[selectedValue].GeoEnrichmentReportName) {
                        form = document.createElement("form");
                        spatialRefernceData = document.createElement("input");
                        postData = document.createElement("input");
                        fileTypeInput = document.createElement("input");
                        reportInput = document.createElement("input");
                        studyAreasInput = document.createElement("input");
                        form.method = "POST";
                        form.action = appGlobals.configData.ProxyUrl + "?" + appGlobals.configData.GeoEnrichmentService + "/GeoEnrichment/CreateReport";
                        form.target = "_blank";
                        postData.value = "bin";
                        postData.name = "f";
                        spatialRefernceData.value = this.map.spatialReference.wkid.toString();
                        spatialRefernceData.name = "inSR";
                        fileTypeInput.value = arrDwnloadDisplayFieldValue[selectedValue].Filetype;
                        fileTypeInput.name = "format";
                        reportInput.value = arrDwnloadDisplayFieldValue[selectedValue].GeoEnrichmentReportName.toString();
                        reportInput.name = "report";
                        studyAreasInput.value = JSON.stringify(this.arrStudyAreas[this.workflowCount]);
                        studyAreasInput.name = "studyAreas";
                        form.appendChild(spatialRefernceData);
                        form.appendChild(postData);
                        form.appendChild(fileTypeInput);
                        form.appendChild(reportInput);
                        form.appendChild(studyAreasInput);
                        document.body.appendChild(form);
                        form.submit();
                        selectDownloadList.reset();
                        selectedValue = 0;
                    } else {
                        if (arrDwnloadDisplayFieldValue[selectedValue].GeoProcessingServiceURL) {
                            downloadWindow = window.open(dojoConfig.baseURL.toString() + "/downloadTemplate.htm", "_blank");
                            //store configured msg in window object
                            downloadWindow.downloadStartedMsg = sharedNls.errorMessages.downloadStartedMsg;
                            topic.publish("showProgressIndicator");
                            if (this.featureGraphics[this.workflowCount]) {
                                this.map.setLevel(appGlobals.configData.ZoomLevel);
                                this.map.centerAt(this.featureGraphics[this.workflowCount].geometry);
                            }
                            webMapJsonData = this._createMapJsonData();
                            params = {
                                "Logo": dojoConfig.baseURL + appGlobals.configData.ApplicationIcon.toString(),
                                "WebMap_Json": JSON.stringify(webMapJsonData),
                                "Report_Title": arrDwnloadDisplayFieldValue[selectedValue].DisplayOptionTitle.toString(),
                                "Report_Data_Json": JSON.stringify([this.arrReportDataJson[this.workflowCount].reportData])
                            };
                            if (this.arrReportDataJson[this.workflowCount].attachmentData.length > 0) {
                                params.Attachment_List = JSON.stringify(this.arrReportDataJson[this.workflowCount].attachmentData);
                            }
                            gp = new Geoprocessor(arrDwnloadDisplayFieldValue[selectedValue].GeoProcessingServiceURL);
                            gp.submitJob(params, lang.hitch(this, function (jobInfo) {
                                topic.publish("hideProgressIndicator");
                                if (jobInfo.jobStatus !== "esriJobFailed") {
                                    if (arrDwnloadDisplayFieldValue[selectedValue].Filetype.toLowerCase() === "pdf") {
                                        gp.getResultData(jobInfo.jobId, "Report_PDF", lang.hitch(this, function (outputFile) {
                                            this._downloadPDFFile(outputFile, downloadWindow);
                                        }));
                                    } else {
                                        gp.getResultData(jobInfo.jobId, "Report_PDF", this._downloadDataFile);
                                    }
                                } else if (jobInfo.jobStatus === "esriJobFailed") {
                                    alert(sharedNls.errorMessages.downloadError);
                                }
                                selectDownloadList.reset();
                                selectedValue = 0;
                            }), null, function (err) {
                                selectDownloadList.reset();
                                selectedValue = 0;
                                topic.publish("hideProgressIndicator");
                                alert(err.message);
                            });
                        }
                    }
                } catch (Error) {
                    topic.publish("hideProgressIndicator");
                    console.log(Error.Message);
                }
            })));
        },

        /**
        * downloads pdf file
        * @param {object} Oot put file
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _downloadPDFFile: function (outputFile, downloadWindow) {
            downloadWindow.location = outputFile.value.url;
        },

        /**
        * downloads data file
        * @param {object} out put file
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _downloadDataFile: function (outputFile) {
            window.location = outputFile.value.url;
        },

        /**
        * creates web map json object
        * @return {Object} return web map json data
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _createMapJsonData: function () {
            var printTaskObj = new PrintTask(), jsonObject, i;
            printTaskObj.legendAll = true;
            jsonObject = printTaskObj._getPrintDefinition(this.map);
            jsonObject.operationalLayers[0].maxScale = 0;
            jsonObject.operationalLayers[0].minScale = 0;
            // checking all operational layers and graphic layers exist
            if (printTaskObj.allLayerslegend && printTaskObj.allLayerslegend.length > 0) {
                jsonObject.layoutOptions = {};
                jsonObject.layoutOptions.legendOptions = {
                    operationalLayers: printTaskObj.allLayerslegend
                };
            }
            // removing graphic layer(Buffer) while generating report for buildings and sites tab
            for (i = 0; i < jsonObject.operationalLayers.length; i++) {
                if (jsonObject.operationalLayers[i].id === "esriBufferGraphicsLayer") {
                    jsonObject.operationalLayers.splice(array.indexOf(jsonObject.operationalLayers, jsonObject.operationalLayers[i]), 1);
                    break;
                }
            }
            jsonObject.exportOptions = { "outputSize": [1366, 412] };
            return jsonObject;
        },

        /**
        * clears the Business tab data
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _clearBusinessData: function () {
            this.businessData = [];
            this.enrichData = [];
            this.salesFinalData = [];
            this.employeFinalData = [];
            this.revenueData = [];
            this.totalArray = [];
            domStyle.set(this.resultDiv, "display", "none");
        },

        /**
        * calculates the total of filtered data in business workflow
        * @param {object} geo enriched data
        * @memberOf widgets/siteLocator/geoEnrichment
        */
        _calculateSum: function (Data) {
            var businessCount = 0, employeeCount = 0, revenueCount = 0, i;
            if (Data) {
                for (i = 0; i < Data.length; i++) {
                    businessCount = businessCount + parseInt(Data[i].Count, 10);
                    employeeCount = employeeCount + parseInt(Data[i].Employees, 10);
                    revenueCount = revenueCount + parseInt(Data[i].Revenue, 10);
                }
                this.divBusinessResult.children[0].children[1].innerHTML = number.format(businessCount, { places: 0 });
                this.divBusinessResult.children[1].children[1].innerHTML = "$" + number.format(revenueCount, { places: 0 });
                this.divBusinessResult.children[2].children[1].innerHTML = number.format(employeeCount, { places: 0 });
            }
        }
    });
});
