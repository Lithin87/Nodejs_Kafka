import gaxios , {request} from 'gaxios';
import jp from 'jsonpath';
import Kafka from 'node-rdkafka';
import ld from 'lodash';
import generate  from './Avro-schema-generator.js';


const adminClient = Kafka.AdminClient.create({
  'client.id': 'kafka-admin',
  'metadata.broker.list': '104.197.189.100:9101',
  'socket.timeout.ms': 5000, 
});

  
gaxios.instance.defaults = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': ['application/json']
  }
}

let template = {
  "name": "Datagen_pre_template",
  "config": {
    "connector.class": "io.confluent.kafka.connect.datagen.DatagenConnector",
    "name": "Datagen_pre_template",
    "schema.string": "{\"connect.name\":\"lithin.personal.ust_data\",\"fields\":[{\"name\":\"Name\",\"type\":{\"type\":\"string\",\"arg.properties\":{\"regex\":\"User_[1-9]{0,1}\"}}},{\"name\":\"office\",\"type\":\"string\"},{\"name\":\"user_id\",\"type\":\"string\"},{\"name\":\"employee_id\",\"type\":\"long\"},{\"name\":\"cubicle_num\",\"type\":\"int\"}],\"name\":\"ust_data\",\"namespace\":\"lithin.personal\",\"type\":\"record\"}",
    "tasks.max": "1",
    "kafka.topic": "Template_Schema"
  }
};

let file_schema = {
  "name": "Datagen_file_schema",
  "config": {
    "connector.class": "io.confluent.kafka.connect.datagen.DatagenConnector",
    "name": "Datagen_file_schema",
    "schema.string": "{\"connect.name\":\"lithin.personal.ust_data\",\"name\":\"ust_data\",\"namespace\":\"lithin.personal\",\"type\":\"record\",\"fields\":[{\"name\":\"store_id\",\"type\":{\"type\":\"int\",\"arg.properties\":{\"range\":{\"min\":1,\"max\":100}}}},{\"name\":\"order_lines\",\"type\":{\"type\":\"array\",\"items\":{\"name\":\"order_line\",\"type\":\"record\",\"fields\":[{\"name\":\"product_id\",\"type\":{\"type\":\"int\",\"arg.properties\":{\"range\":{\"min\":1,\"max\":100}}}},{\"name\":\"category\",\"type\":{\"type\":\"string\",\"arg.properties\":{\"regex\":\"User_[1-9]{0,1}\"}}},{\"name\":\"quantity\",\"type\":{\"type\":\"int\",\"arg.properties\":{\"range\":{\"min\":1,\"max\":100}}}},{\"name\":\"unit_price\",\"type\":{\"type\":\"float\",\"arg.properties\":{\"range\":{\"min\":0.1,\"max\":10}}}},{\"name\":\"net_price\",\"type\":{\"type\":\"float\",\"arg.properties\":{\"range\":{\"min\":0.1,\"max\":10}}}}]},\"arg.properties\":{\"length\":{\"min\":1,\"max\":5}}}}]}",
    "tasks.max": "1",
    "kafka.topic": "Regex_Schema"
  }
};

const schema_replace_s = (schema) => { if( schema != "") ld.set(template, ['config', 'schema.string'], schema);  return JSON.stringify(template)}
const schema_replace_f = (json) => { if( json != "") ld.set(file_schema, ['config', 'schema.string'], JSON.stringify(generate(json)));  return JSON.stringify(file_schema) }


const r1 = () => request({ url: ips[0]+'/connector-plugins' }).then( printDataFull ).catch(printError)
const r2 = (a,b) => { request({ url: ips[2]+'/subjects/'+a, method: 'DELETE'}).then(b).catch(printError) }
const r3 = (template,b) => { request({ url: ips[0]+'/connectors', method: 'POST', data: template }).then(b).catch(printError) }
// const r4 = () => request({ url: ips[0]+'/connector-plugins' }).then( printDataFull ) 


const req0 =  () => r1(ips);
const req1 =  (schema) =>  r2( "Template_Schema-value" ,  r3(schema_replace_s(schema),printData))    
const req2 = (schema) => { r2( "Regex_Schema-value" ,  r3(schema_replace_f(schema),printData)) }
  
  // getIPAddressURL().then(a => { request({ url: a+'/connectors', method: 'POST', data: schema_replace_f(schema) }).then(printData).catch(printError) })}
const req3 = async () => {del_connectors()  }
const req4 = (schema) => {getIPAddressURL().then(a => { request({ url: '/connector-plugins/DatagenConnector/config/validate', data: schema, method: 'put' }).then((res) => console.log(res.data)).catch(printError) })}
const req5 =  () => {   getUserInput().then(printData).catch(printError) };
// const request6 = () => { method: 'POST', url: 'https://example.com/api/data2', body: { name: 'John', age: 30 } };
// const request7 = () => { method: 'POST', url: 'https://example.com/api/data2', body: { name: 'John', age: 30 } };
// const request8 = () => { method: 'POST', url: 'https://example.com/api/data2', body: { name: 'John', age: 30 } };

const  del_connectors = async () => { await request({ url: ips[0]+'/connectors' }).then((response) => {
  if ( response.data.length  == 0)
  {console.log("No Connectors present")}
  else{
  response.data.forEach((element) => {
      request({ url: ips[0]+`/connectors/${element}`, method: 'delete' }).then(console.log(element + " : DELETED"));
  })}
})}


export const requests = [req0, req1, req2, req3,req4, req5];


const printError = (response) => { 
    // console.dir(response, { depth : null});
    let msg = jp.query(response, "$..response.data.message");
   if( msg.length != 0) 
      console.dir(msg)
      else
      console.log("Containers aren't up..Either start the containers or Wait")}

const printData = (response) => { console.log(jp.query(response, "$..statusText",1))} ;  
const printDataFull = (response) => { console.log(response.data)} ; 




  





