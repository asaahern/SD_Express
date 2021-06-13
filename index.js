// Import modules
const express            = require('express')
const cors               = require('cors')
const mongoose           = require('mongoose')
const moment             = require('moment')

const app                = express()
const { Schema , model } = mongoose


// Connect to MongoDB
mongoose.connect('mongodb://localhost/nodejs-mongo',{
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
.then( ( res )=>{  console.log(`Conectado a Mongo`) })


// Define user entries in database
const UserSchema = new Schema({
    nombre        : {type : String},
    apellidos     : {type : String},
    edad          : {type: Number},
    dni           : {type: String},
    cumpleanos    : {type: Date},
    colorFavorito : {type: String},
    sexo          : {type: String}    
})
const User = model('user',UserSchema);


// Launch Node server using Express
app .use( cors() )
    .use(express.urlencoded({extended:true}))
    .use(express.json())
    .listen( 3000 , ()=>{
        console.log('Server de Node corriendo en http://localhost:3000')
    })

// Function for validations
function Validation(data) {
    moment().format();
    const errors = [];

    // Define valid regular expressions
    const validtext = /^[a-zA-Z ]*$/;
    const validnum  = /^[0-9]/;
    const validdni  = /^[0-9]{8}[A-Z]$/;

    if (validtext.test(data.nombre) == false || data.nombre.length < 3) {
        errors.push("El nombre debe tener más de 3 caracteres y no puede contener números.");
    }
    if (validtext.test(data.apellidos) == false || data.apellidos.length < 3) {
        errors.push("El apellido debe tener más de 3 caracteres y no puede contener números.");
    } 
    if (validnum.test(data.edad) == false || (data.edad >= 125 || data.edad < 0)) {
        errors.push("La edad debe ser un numero comprendido entre 0 y 125.");
    }
    if (validdni.test(data.dni) == false) {
        errors.push("El DNI deben tener 8 números y una letra (mayúscula).");
    }
    if (moment(data.cumpleanos, 'YYYY-MM-DD', true).isValid() == false) {
        errors.push("Introduzca una fecha en formato ISO8601: AAAA-MM-DD.");
    } //(source: https://stackoverflow.com/questions/22164541/validating-a-iso-8601-date-using-moment-js)
    if (validtext.test(data.colorFavorito) == false || data.colorFavorito.length < 3) {
        errors.push("El color debe tener más de 3 caracteres y no puede contener números.");
    }
    if (data.sexo != "Hombre" && data.sexo != "Mujer" && data.sexo != "No binario" && data.sexo != "Prefiero no decirlo") {
        errors.push("El sexo puede ser: Mujer, Hombre, No binario o Prefiero no decirlo.");
    }
    return errors;
}


// Define server functionality
app.get('/users', async ( req  , res )=>{
    const users = await User.find()
    res.json( users )
})

app.post('/users', async ( req , res )=>{
    const testResult = Validation(req.body);    
    if(testResult.length < 1) {
        const nuevoUsuario = new User(req.body)
        await nuevoUsuario.save()
        res.json({ mensaje : "Usuario creado" })
    }else{
        res.json(testResult);
    }
})

app.put('/users/:id', async (req, res) =>{
        await User.findById(req.params.id, function(err, contacto) {
            const testResult = Validation(req.body);
            if (testResult.length < 1) {
                contacto.nombre = req.body.nombre;
                contacto.apellidos = req.body.apellidos;
                contacto.edad = req.body.edad;
                contacto.dni = req.body.dni;
                contacto.cumpleanos = req.body.cumpleanos;
                contacto.colorFavorito = req.body.colorFavorito;
                contacto.sexo = req.body.sexo;

                contacto.save()
                res.json({ mensaje : "Usuario actualizado" })
            } else {
                res.json(testResult);
            }
    })
})

app.delete('/users/:id', async (req, res) => {
    const userDeleted = await User.findByIdAndDelete(req.params.id)
    res.json({ status: "Usuario eliminado" })
})