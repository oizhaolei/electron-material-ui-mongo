import mongoose from 'mongoose';

import Mdb from './mdb';
import config from './config';

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
        ft: 'symptoms.patient', // foreign table
      },
      age: {
        type: 'String',
      },
      sex: {
        type: 'String',
        suggest: ['male', 'female'], // like enum, but NOT strictable
      },
    },
    {
      label: 'Patients',
      icon: 'Person',
    }
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
        fk: 'patients.name', // foreign key
      },
    },
    {
      label: 'Symptoms',
      icon: 'Camera',
    }
  );

  // get a SchemaModel and CRUD
  const PatientModel = await mdb.getSchemaModel(patientSchema.table);
  const SymptomModel = await mdb.getSchemaModel(symptomSchema.table);

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
        fk: 'patient.name',
      },
      age: {
        type: 'String',
      },
      gendar: {
        type: 'String',
        suggest: ['male', 'female'],
      },
    }
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

  // removeSchema
  const removeResult = await mdb.removeSchema(patientSchema.table);
  console.log('removeResult', removeResult);
  await mdb.removeSchema(symptomSchema.table);
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
