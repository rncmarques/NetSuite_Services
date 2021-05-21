/**
 * @NApiVersion 2.1
 * @NScriptType Restlet
 */
define(['N/query','N/format','N/search','N/record'],
    
    (query,format,search,record) => {
        /**
         * Defines the function that is executed when a GET request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const get = (requestParams) => {

                try{
                        //initialise code block variables
                        let results = [];
                        let slice = [];
                        let i = 0;
                        let sl = "recmachcustrecord_mc_fulpol_fulfillmentzone"; //Fulfillment policy sublist ID
                        let pc = "custentity_ff_masterpostcode"; //Customer record Master Postcode ID
                        let pdm = "customrecord_ff_postcodedatamaster"; //Postcode data master record ID
                        let fz = "custrecord_mc_fulfillmentzone"; //Postcode fulfillment zone field ID
                        let fzr = "customrecord_mc_fulfillmentzone"; //Fulfillment Zone custom record ID
                        let fploc = "custrecord_mc_fulpol_location" //Fulfillment policy Location field ID
                        let fprng = "custrecord_mc_fulfpol_range" //Fulfillment policy range field ID
                        let fppt = "custrecord_mc_fulpol_packtype" //Fulfillment policy packtype field ID
                        let fpcls = "custrecord_mc_fulpol_prodclass" //Fulfillment policy Class field ID
                        let invCusSrch = "customsearch_mc_invavailproto" //Inventory Balance Saved Search ID
                        let rec = new Set;

                        //retrieve the customer record for which inventory availability must be evaluated
                        let customerSearchResult = search.create({
                                type: 'customer',
                               filters: [{ name: 'entityId', operator: 'is', values: requestParams.customer }]
                        }).run().getRange({ start: 0, end: 1 });

                        let customerIID = customerSearchResult[0].id;

                        let cust = record.load({ id: customerIID, type: record.Type.CUSTOMER});

                        //Retrieve the fulfillment rules related to the customer
                        //Customer -> Postcode -> Fulfillment Zone -> Fulfillment Rules

                       /* [
                                "owner",
                                "iddisp",
                                "custrecord_mc_fulpol_packtype",
                                "sys_parentid",
                                "custrecord_mc_fulfpol_range",
                                "custrecord_mc_fulfillmentruletype",
                                "custrecord_mc_fulpol_packtype_display",
                                "recordischanged",
                                "custrecord_mc_fulpol_location",
                                "version",
                                "custrecord_mc_fulfpol_range_display",
                                "sys_id",
                                "custrecord_mc_fulpol_location_display",
                                "custrecord_mc_fulpol_prodclass_display",
                                "custrecord_mc_fulpol_prodclass",
                                "custrecord_mc_fulpol_subsidiary",
                                "custrecord_mc_fulpol_subsidiary_display",
                                "custrecord_mc_fulpol_fulfillmentzone",
                                "id"
                        ]*/

                        let postcodeId = cust.getValue({fieldId : pc});
                        let postcode = record.load({type: pdm, id : postcodeId});
                        let fulfillmentZoneId = postcode.getValue({fieldId : fz});
                        let fulfillmentZone = record.load({type: fzr , id: fulfillmentZoneId});
                        let f = fulfillmentZone.getLineCount(sl);

                        //Loop through each fulfillment policy
                        for (let n=0; n<f; n++)
                        {
                                let policyLocation = fulfillmentZone.getSublistValue({sublistId : sl, fieldId : fploc, line : n});
                                let policyRange = fulfillmentZone.getSublistValue({sublistId : sl, fieldId : fprng, line : n});
                                let policyPacktype = fulfillmentZone.getSublistValue({sublistId : sl, fieldId : fppt, line : n});
                                let policyClass = fulfillmentZone.getSublistValue({sublistId : sl, fieldId : fpcls, line : n});

                                let srch = search.load({
                                        "id" : invCusSrch,
                                        "type" : "inventoryBalance"
                                });

                                if (policyLocation)
                                {
                                        let locFilter = search.createFilter({
                                                name: 'location',
                                                operator: search.Operator.ANYOF,
                                                values: policyLocation
                                        });
                                        srch.filters.push(locFilter);
                                }

                                if (policyPacktype) {
                                        let packFilter = search.createFilter({
                                                name: 'custitem_mco_itempacktype',
                                                join: 'item',
                                                operator: search.Operator.ANYOF,
                                                values: policyPacktype
                                        });
                                        srch.filters.push(packFilter);
                                }

                                if (policyRange) {
                                        let rangeFilter = search.createFilter({
                                                name: 'custitem_ff_itemrange',
                                                join: 'item',
                                                operator: search.Operator.ANYOF,
                                                values: policyRange
                                        });
                                        srch.filters.push(rangeFilter);
                                }

                                let resultSet = srch.run();


                                do {
                                        slice = resultSet.getRange({ start: i, end: i + 999 });

                                        //loop through the search results
                                        for(let j in slice){
                                                //create placeholder object place holder
                                                let obj = new SearchRow(
                                                    //set the values of the object with the values of the appropriate columns
                                                    slice[j].getText(resultSet.columns[0]),
                                                    slice[j].getText(resultSet.columns[1]),
                                                    slice[j].getValue(resultSet.columns[2]),
                                                    slice[j].getValue(resultSet.columns[3]),
                                                    slice[j].getValue(resultSet.columns[4])
                                                );

                                                //add the object to the array of results
                                                if(!rec.has(obj.location + '_' + obj.item))
                                                {
                                                        results.push(obj);
                                                        rec.add(obj.location + '_' + obj.item);
                                                }
                                        }
                                } while (slice.length >= 1000);
                        }
                        return results;

                }
                catch (err)
                {
                        log.debug({title : "GET", details: JSON.stringify(err)});
                        return "err";
                }


        }

            //Object to serve a place holder for each search row
            function SearchRow(loc,itm,desc,oh,av){
                    this.location = loc;
                    this.item = itm;
                    this.description = desc;
                    this.onhand = oh;
                    this.available = av;
            }

        /**
         * Defines the function that is executed when a PUT request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body are passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const put = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a POST request is sent to a RESTlet.
         * @param {string | Object} requestBody - The HTTP request body; request body is passed as a string when request
         *     Content-Type is 'text/plain' or parsed into an Object when request Content-Type is 'application/json' (in which case
         *     the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const post = (requestBody) => {

        }

        /**
         * Defines the function that is executed when a DELETE request is sent to a RESTlet.
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters are passed as an Object (for all supported
         *     content types)
         * @returns {string | Object} HTTP response body; returns a string when request Content-Type is 'text/plain'; returns an
         *     Object when request Content-Type is 'application/json' or 'application/xml'
         * @since 2015.2
         */
        const doDelete = (requestParams) => {

        }

        return {get, put, post, delete: doDelete}

    });
