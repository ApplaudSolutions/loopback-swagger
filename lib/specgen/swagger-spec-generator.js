// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-swagger
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// Globalization
var g = require('strong-globalize')();

/**
 * Module dependencies.
 */
var path = require('path');
var _ = require('lodash');
var routeHelper = require('./route-helper');
var modelHelper = require('./model-helper');
var typeConverter = require('./type-converter');
var tagBuilder = require('./tag-builder');
var TypeRegistry = require('./type-registry');
var globalSwaggerObject;

/**
 * Create Swagger Object describing the API provided by loopbackApplication.
 *
 * @param {Application} loopbackApplication The application to document.
 * @param {Object} opts Options.
 * @returns {Object}
 */

 function addHasManyAndReferencesManyRoutes(paths, classes) {
  _.each(classes,(modelClass, key)=>{
     let basePath = `/custom/${_.get(modelClass, 'slugWithTenantId')}/{id}/`;
     //Attaching hasMany relations API
    if(_.get(modelClass,'ctor.hasManyRelations.length')) {
      _.each(_.get(modelClass,'ctor.hasManyRelations'),(hasManyRelationDetails)=>{
        const hasManyRelation = _.get(hasManyRelationDetails, 'name');
        const hasManyRelationModel = _.get(hasManyRelationDetails, 'model');
        if(hasManyRelation && hasManyRelationDetails){
          const path1 = basePath+hasManyRelation;
          paths[path1]= {
            "get":{
            "tags":[
              _.get(modelClass, 'ctor.modelName')
            ],
            "summary":`Queries ${hasManyRelation} of ${_.get(modelClass, 'ctor.modelName')}.`,
            "operationId":`${_.get(modelClass, 'ctor.modelName')}.prototype.__get__${hasManyRelation}`,
            "parameters":[
            {
            "name":"id",
            "in":"path",
            "description":`${_.get(modelClass, 'ctor.modelName')} id`,
            "required":true,
            "type":"string",
            "format":"JSON"
            },
            {
            "name":"filter",
            "in":"query",
            "required":false,
            "type":"string",
            "format":"JSON"
            }
            ],
            "responses":{
            "200":{
            "description":"Request was successful",
            "schema":{
            "type":"array",
            "items":{
            "$ref":`#/definitions/${hasManyRelationModel}`
            }
            }
            }
            },
            "deprecated":false
            },
            "post":{
            "tags":[
              _.get(modelClass, 'ctor.modelName')
            ],
            "summary":`Creates a new instance in ${hasManyRelation} of this model.`,
            "operationId":`${_.get(modelClass, 'ctor.modelName')}.prototype.__create__${hasManyRelation}`,
            "parameters":[
            {
            "name":"id",
            "in":"path",
            "description":`${_.get(modelClass, 'ctor.modelName')} id`,
            "required":true,
            "type":"string",
            "format":"JSON"
            },
            {
            "name":"data",
            "in":"body",
            "required":false,
            "schema":{
            "$ref":`#/definitions/${hasManyRelationModel}`
            }
            }
            ],
            "responses":{
            "200":{
            "description":"Request was successful",
            "schema":{
            "$ref":`#/definitions/${hasManyRelationModel}`
            }
            }
            },
            "deprecated":false
            },
            "delete":{
            "tags":[
            _.get(modelClass, 'ctor.modelName')
            ],
            "summary":`Deletes all ${hasManyRelation} of this model.`,
            "operationId":`${_.get(modelClass, 'ctor.modelName')}.prototype.__delete__${hasManyRelation}`,
            "parameters":[
            {
            "name":"id",
            "in":"path",
            "description":`${_.get(modelClass, 'ctor.modelName')} id`,
            "required":true,
            "type":"string",
            "format":"JSON"
            }
            ],
            "responses":{
            "204":{
            "description":"Request was successful"
            }
            },
            "deprecated":false
            }
            }
        }
      });
    }
     //Attaching referencesManyRelations relations API
     if(_.get(modelClass, 'ctor.referencesManyRelations.length')){
      _.each(_.get(modelClass,'ctor.referencesManyRelations'),(referencesManyRelationDetails)=>{
        const referencesManyRelation = _.get(referencesManyRelationDetails, 'name');
        const referencesManyRelationModel = _.get(referencesManyRelationDetails, 'model');
        const path2 = basePath+referencesManyRelation;
        paths[path2]= {
          "get":{
          "tags":[
            _.get(modelClass, 'ctor.modelName')
          ],
          "summary":`Queries refmanies of ${_.get(modelClass, 'ctor.modelName')}.`,
          "operationId":`${_.get(modelClass, 'ctor.modelName')}.prototype.__get__${referencesManyRelation}`,
          "parameters":[
          {
          "name":"id",
          "in":"path",
          "description":`${_.get(modelClass, 'ctor.modelName')} id`,
          "required":true,
          "type":"string",
          "format":"JSON"
          },
          {
          "name":"filter",
          "in":"query",
          "required":false,
          "type":"string",
          "format":"JSON"
          }
          ],
          "responses":{
          "200":{
          "description":"Request was successful",
          "schema":{
          "type":"array",
          "items":{
          "$ref":`#/definitions/${referencesManyRelationModel}`
          }
          }
          }
          },
          "deprecated":false
          },
          "post":{
          "tags":[
          _.get(modelClass, 'ctor.modelName')
          ],
          "summary":`Creates a new instance in ${referencesManyRelation} of this model.`,
          "operationId":`${_.get(modelClass, 'ctor.modelName')}.prototype.__create__${referencesManyRelation}`,
          "parameters":[
          {
          "name":"id",
          "in":"path",
          "description":`${_.get(modelClass, 'ctor.modelName')} id`,
          "required":true,
          "type":"string",
          "format":"JSON"
          },
          {
          "name":"data",
          "in":"body",
          "required":false,
          "schema":{
          "$ref":`#/definitions/${referencesManyRelationModel}`
          }
          }
          ],
          "responses":{
          "200":{
          "description":"Request was successful",
          "schema":{
          "$ref":`#/definitions/${referencesManyRelationModel}`
          }
          }
          },
          "deprecated":false
          },
          "delete":{
          "tags":[
            _.get(modelClass, 'ctor.modelName')
          ],
          "summary":`Deletes all ${referencesManyRelation} of this model.`,
          "operationId":`${_.get(modelClass, 'ctor.modelName')}.prototype.__delete__${referencesManyRelation}`,
          "parameters":[
          {
          "name":"id",
          "in":"path",
          "description":`${_.get(modelClass, 'ctor.modelName')} id`,
          "required":true,
          "type":"string",
          "format":"JSON"
          }
          ],
          "responses":{
          "204":{
          "description":"Request was successful"
          }
          },
          "deprecated":false
          }
          }
        });

     }
     function addConcreteRemoteMethods(){
      let basePath1 = `/custom/${_.get(modelClass, 'slugWithTenantId')}`;
      paths[`${basePath1}/bulkUpsert`]= {
        "patch":{
          "tags":[
            _.get(modelClass, 'ctor.modelName')
          ],
          "summary":"Creates or updates an array of records (bulkUpsert)",
          "operationId":`${_.get(modelClass, 'ctor.modelName')}.bulkUpsert`,
          "parameters":[
             {
                "name":"data",
                "in":"body",
                "required":false,
                "schema":{
                   "$ref":`#/definitions/${_.get(modelClass, 'ctor.modelName')}`
                }
             }
          ],
          "responses":{
             "200":{
                "description":"Request was successful",
                "schema":{
                   "type":"object"
                }
             }
          },
          "deprecated":false
       }
      }
      paths[`${basePath1}/by-ids`]= {
        "delete":{
           "tags":[
            _.get(modelClass, 'ctor.modelName')
           ],
           "summary":"delete multiple data using an array of ids",
           "operationId":`${_.get(modelClass, 'ctor.modelName')}.MultiDeleteByIds`,
           "parameters":[
              {
                 "name":"ids",
                 "in":"formData",
                 "required":true,
                 "type":"string",
                 "format":"JSON"
              }
           ],
           "responses":{
              "200":{
                 "description":"Request was successful",
                 "schema":{
                    "type":"object"
                 }
              }
           },
           "deprecated":false
        }
     }
     }
     addConcreteRemoteMethods();
   });
 }
 
module.exports = function createSwaggerObject(loopbackApplication, opts, modelName) {
  opts = _.defaults(opts || {}, {
    basePath: loopbackApplication.get('restApiRoot') || '/api',
    // Default consumes/produces
    consumes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'application/xml', 'text/xml',
    ],
    produces: [
      'application/json',
      'application/xml', 'text/xml',
      // JSONP content types
      'application/javascript', 'text/javascript',
    ],
    version: getPackagePropertyOrDefault('version', '1.0.0'),
  });

  // We need a temporary REST adapter to discover our available routes.
  var remotes = loopbackApplication.remotes();
  var adapter = remotes.handler('rest').adapter;
  var routes = adapter.allRoutes();
  var classes = remotes.classes();

  // Generate fixed fields like info and basePath
  var swaggerObject = generateSwaggerObjectBase(opts, loopbackApplication);

  var typeRegistry = new TypeRegistry();
  var operationIdRegistry = Object.create(null);
  var loopbackRegistry = loopbackApplication.registry ||
                         loopbackApplication.loopback.registry ||
                         loopbackApplication.loopback;
  var models = loopbackRegistry.modelBuilder.models;
  for (var modelName in models) {
    modelHelper.registerModelDefinition(models[modelName], typeRegistry, opts);
  }

  // A class is an endpoint root; e.g. /users, /products, and so on.
  // In Swagger 2.0, there is no endpoint roots, but one can group endpoints
  // using tags.
  classes.forEach(function(aClass) {
    if (!aClass.name) return;

    var hasDocumentedMethods = aClass.methods().some(function(m) {
      return m.documented;
    });
    if (!hasDocumentedMethods) return;

    swaggerObject.tags.push(tagBuilder.buildTagFromClass(aClass));
  });

  // A route is an endpoint, such as /users/findOne.
  routes.forEach(function(route) {
    if (!route.documented) return;

    // Get the class definition matching this route.
    var className = route.method.split('.')[0];
    var classDef = classes.filter(function(item) {
      return item.name === className;
    })[0];

    if (!classDef) {
      g.error('Route exists with no class: %j', route);
      return;
    }

    routeHelper.addRouteToSwaggerPaths(route, classDef,
      typeRegistry, operationIdRegistry,
      swaggerObject.paths, opts, modelName);
  });

  _.assign(swaggerObject.definitions, typeRegistry.getDefinitions());

  if (modelName) addHasManyAndReferencesManyRoutes(swaggerObject.paths, classes)
  
  loopbackApplication.emit('swaggerResources', swaggerObject);
  
  if (!globalSwaggerObject) globalSwaggerObject = swaggerObject;
  else {
    _.each(_.get(swaggerObject,'definitions'),(val, key)=>{
      if (_.get(globalSwaggerObject,'definitions')){
        globalSwaggerObject.definitions[key]=val;
      }
    });
    _.each(_.get(swaggerObject,'paths'),(val, key)=>{
      if (_.get(globalSwaggerObject,'paths')){
        globalSwaggerObject.paths[key]=val;
      }
    });
    _.each(_.get(swaggerObject,'tags'),(tag)=>{
      if (_.get(globalSwaggerObject,'tags') && tag){
        const index = _.findIndex(_.get(globalSwaggerObject,'tags'), {name: tag.name});
        if (index>=0)globalSwaggerObject.tags[index]=tag;
        else globalSwaggerObject.tags.push(tag);
      }
    });
  }
    return globalSwaggerObject;
};

/**
 * Generate a top-level resource doc. This is the entry point for swagger UI
 * and lists all of the available APIs.
 * @param  {Object} opts Swagger options.
 * @return {Object}      Resource doc.
 */
function generateSwaggerObjectBase(opts, loopbackApplication) {
  var swaggerSpecExtensions = loopbackApplication.get('swagger');
  var apiInfo = _.cloneDeep(opts.apiInfo) || {};
  for (var propertyName in apiInfo) {
    var property = apiInfo[propertyName];
    apiInfo[propertyName] = typeConverter.convertText(property);
  }
  apiInfo.version = String(apiInfo.version || opts.version);
  if (!apiInfo.title) {
    apiInfo.title = getPackagePropertyOrDefault('name', 'LoopBack Application');
  }

  if (!apiInfo.description) {
    apiInfo.description = getPackagePropertyOrDefault(
      'description',
      'LoopBack Application'
    );
  }

  var basePath = opts.basePath;
  if (basePath && /\/$/.test(basePath))
    basePath = basePath.slice(0, -1);

  return _.defaults({
    swagger: '2.0',
    info: apiInfo,
    basePath: basePath,
    paths: {},
    tags: [],
  }, swaggerSpecExtensions || {}, {
    host: opts.host,
    schemes: opts.protocol ? [opts.protocol] : undefined,
    consumes: opts.consumes,
    produces: opts.produces,
    definitions: opts.models || {},
    // TODO Authorizations (security, securityDefinitions)
    // TODO: responses, externalDocs
  });
}

function getPackagePropertyOrDefault(name, defautValue) {
  try {
    var pkg = require(path.join(process.cwd(), 'package.json'));
    return pkg[name] || defautValue;
  } catch (e) {
    return defautValue;
  }
}
