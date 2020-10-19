import mongoose from 'mongoose';

import Mdb from '../app/mdb';
import config from '../app/config';

mongoose.set('debug', (coll, method, query, doc, options) => {
  console.log(`${coll}.${method}.(${JSON.stringify(query)})`, JSON.stringify(doc), options || '');
});


const main = async () => {
  const mdb = new Mdb();

  // createSchema
  const patientSchema = await mdb.createSchema(
    'patients',
    {
      name: {
        type: 'String',
      },
      age: {
        type: 'String',
      },
      sex: {
        type: 'String',
        default: 'male',
      },
    },
    {
      suggests: {
        sex: ['male', 'female'],
      },
    },
  );
  const symptomSchema = await mdb.createSchema(
    'symptoms',
    {
      name: {
        type: 'String',
      },
      memo: {
        type: 'String',
      },
      patient: {
        type: 'String',
      },
    },
    {
      suggests: {
      },
    }
  );

  // get a SchemaModel and CRUD
  const PatientModel = await mdb.getSchemaModel(patientSchema.name);
  const SymptomModel = await mdb.getSchemaModel(symptomSchema.name);

  const patientDoc = new PatientModel({
    name: 'charlie',
    age: '18',
    sex: 'male',
  });
  await patientDoc.save();
  console.log('patientDoc', patientDoc);
  const symptomDoc = new SymptomModel({
    name: 'cancer',
    memo: 'just 18',
    patient: 'charlie',
  });
  await symptomDoc.save();
  console.log('symptomDoc', symptomDoc);

  //change schema
  const newSchemaDoc = await mdb.changeSchema(
    'patients',
    {
      name: {
        type: 'String',
      },
      age: {
        type: 'String',
      },
      gendar: {
        type: 'String',
      },
    },
    {
      suggests: {
        gendar: ['male', 'female'],
      },
    },
);
  console.log('newSchemaDoc', newSchemaDoc);

  await PatientModel.updateMany({}, { $rename: { sex: 'gendar' } });
  const newPatientDoc = await PatientModel.findById(patientDoc._id);
  console.log('newPatientDoc', newPatientDoc);
  const symptoms = await SymptomModel.find({
    patient: newPatientDoc.name,
  });
  console.log('symptoms', symptoms);

  //change schema

  const deletedPatientData = await PatientModel.findByIdAndRemove(patientDoc._id);
  console.log('deletedPatientData', deletedPatientData);

  // getSchemas
  const schemas = await mdb.getSchemas();
  console.log('schemas', schemas);

  // dropSchema
  const removeResult = await mdb.dropSchema(patientSchema.name);
  console.log('removeResult', removeResult);
  await mdb.dropSchema(symptomSchema.name);
};

mongoose.connect(config.mongoose.connect, config.mongoose.options).then(() => {
  main().then(() => {
    mongoose.disconnect();
    process.exit();
  }).catch((err) => {
    console.log('err:', err);
    mongoose.disconnect();
    process.exit();
  });
});
