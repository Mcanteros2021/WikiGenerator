import { google } from 'googleapis';
import fs from 'fs';
async function obtenerCredenciales(rutaCredenciales) {
    try {
        return JSON.parse(fs.readFileSync(rutaCredenciales));
    } catch (error) {
        console.error('Error al obtener las credenciales:', error);
        throw error;
    }
}

async function autorizarCliente(credenciales, alcance) {
    try {
        const cliente = new google.auth.JWT(
            credenciales.client_email,
            null,
            credenciales.private_key,
            alcance
        );
        await cliente.authorize();
        return cliente;
    } catch (error) {
        console.error('Error al autorizar el cliente:', error);
        throw error;
    }
}

async function procesarKeywords() {
    const hoja = 'Hoja 1';
    const idArchivo = '1hLDlENMuyH2bwlNzPkC6O7ypHYVJoQVAUBPf25yKAbU';

    // Obtener las credenciales y autorizar al cliente
    const rutaCredenciales = './credentials.json';
    const alcance = ['https://www.googleapis.com/auth/spreadsheets'];

    const credenciales = await obtenerCredenciales(rutaCredenciales);
    const cliente = await autorizarCliente(credenciales, alcance);

    // Crear la instancia de Sheets API
    const apiSheets = google.sheets({ version: 'v4', auth: cliente });

    const keywords = await leerPrimeraColumna(idArchivo, hoja);

    for (let i = 0; i < keywords.length; i++) {
        const keyword = keywords[i];

        // Aquí creamos el JSON estático
        const data = {
            title: "Ejemplo de Título",
            subheadlines: ["Subtítulo 1", "Subtítulo 2", "Subtítulo 3", "Subtítulo 2", "Subtítulo 3"],
            contents: ["Contenido 1", "Contenido 2", "Contenido 3", "Contenido 2", "Contenido 3"]
        }

        const headline =  data.title
        const subheadlines = data.subheadlines;
        const contents = data.contents;

        await actualizarArchivoGoogleSheets(
            idArchivo,
            hoja,
            i + 2, // Fila correspondiente a la keyword
            headline,
            subheadlines,
            contents
        );
    }
}


async function actualizarArchivoGoogleSheets(idArchivo, hoja, fila, headline, subheadlines, contents) {
    try {
        const rutaCredenciales = './credentials.json';
        const alcance = ['https://www.googleapis.com/auth/spreadsheets'];

        const credenciales = await obtenerCredenciales(rutaCredenciales);
        const cliente = await autorizarCliente(credenciales, alcance);
        const apiSheets = google.sheets({ version: 'v4', auth: cliente });

        const rango = `${hoja}!B${fila}:M${fila}`;

        const valoresContenidos = [[headline, ...subheadlines, ...contents]];

        await apiSheets.spreadsheets.values.update({
            spreadsheetId: idArchivo,
            range: rango,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: valoresContenidos },
        });

        console.log('Archivo actualizado correctamente.');
    } catch (error) {
        console.error('Error al actualizar el archivo:', error);
    }
}



async function leerPrimeraColumna() {

    const hoja = 'Hoja 1';
    const idArchivo = '1hLDlENMuyH2bwlNzPkC6O7ypHYVJoQVAUBPf25yKAbU';

    try {
        const rutaCredenciales = './credentials.json';
        const alcance = ['https://www.googleapis.com/auth/spreadsheets'];

        const credenciales = await obtenerCredenciales(rutaCredenciales);
        const cliente = await autorizarCliente(credenciales, alcance);
        const apiSheets = google.sheets({ version: 'v4', auth: cliente });

        const rango = `${hoja}!A2:A`;

        const respuesta = await apiSheets.spreadsheets.values.get({
            spreadsheetId: idArchivo,
            range: rango,
        });

        const valoresColumna = respuesta.data.values;

        if (valoresColumna && valoresColumna.length) {
            const columna = valoresColumna.map((fila) => fila[0]);
            console.log('Valores de la primera columna:', columna);
            return columna;
        } else {
            console.log('No se encontraron valores en la primera columna.');
            return [];
        }
    } catch (error) {
        console.error('Error al leer la primera columna:', error);
        return [];
    }
}

procesarKeywords();