import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

const createDirectoryIfNotExists = (dir: string) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const generatePDF = (notaVenta: any, contenido: any[]) => {
    const doc = new PDFDocument();
    const filename = `nota_venta_${notaVenta.id}.pdf`;

    const pdfDir = path.join(__dirname, '../../pdfs');
    createDirectoryIfNotExists(pdfDir); 

    doc.pipe(fs.createWriteStream(`${pdfDir}/${filename}`));

    doc.fontSize(20).text(`Nota de Venta: ${notaVenta.id}`, { align: 'center' });
    doc.moveDown();
    doc.text(`Dirección de Facturación: ${notaVenta.direccion_facturacion}`);
    doc.text(`Dirección de Envío: ${notaVenta.direccion_envio}`);
    doc.text(`Total: $${notaVenta.total}`);
    doc.moveDown();

    doc.text('Contenido de la Nota de Venta:', { underline: true });
    contenido.forEach(item => {
        doc.text(`Producto: ${item.producto} | Cantidad: ${item.cantidad} | Precio Unitario: $${item.precio_unitario} | Importe: $${item.importe}`);
    });

    doc.end();
    return filename;
}

export default generatePDF;
