const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Colors
const DARK = "1A1A1A";
const ACCENT = "3C3C3B";
const LIGHT_BG = "F5F5F5";
const BORDER_COLOR = "DDDDDD";
const WHITE = "FFFFFF";

// Table helpers
const contentWidth = 9360;
const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorders = { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };
const cellMargins = { top: 100, bottom: 100, left: 150, right: 150 };

function sectionHeader(number, title) {
    return [
        new Paragraph({ spacing: { before: 100 }, children: [] }),
        new Paragraph({
            spacing: { before: 200, after: 80 },
            children: [
                new TextRun({ text: `SEZIONE ${number}`, font: "Arial", size: 18, color: ACCENT, bold: true, allCaps: true }),
            ],
        }),
        new Paragraph({
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: ACCENT, space: 8 } },
            children: [
                new TextRun({ text: title, font: "Arial", size: 36, color: DARK, bold: true }),
            ],
        }),
    ];
}

function instruction(text) {
    return new Paragraph({
        spacing: { before: 80, after: 160 },
        children: [
            new TextRun({ text: text, font: "Arial", size: 20, color: "666666", italics: true }),
        ],
    });
}

function fieldLabel(label) {
    return new Paragraph({
        spacing: { before: 200, after: 60 },
        children: [
            new TextRun({ text: label, font: "Arial", size: 22, color: DARK, bold: true }),
        ],
    });
}

function fieldBox(placeholder) {
    return new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: [contentWidth],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders,
                        width: { size: contentWidth, type: WidthType.DXA },
                        shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        children: [
                            new Paragraph({
                                spacing: { before: 0, after: 0 },
                                children: [
                                    new TextRun({ text: placeholder, font: "Arial", size: 20, color: "AAAAAA", italics: true }),
                                ],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

function fieldBoxTall(placeholder, lines) {
    const children = [
        new Paragraph({
            spacing: { before: 0, after: 0 },
            children: [
                new TextRun({ text: placeholder, font: "Arial", size: 20, color: "AAAAAA", italics: true }),
            ],
        }),
    ];
    for (let i = 0; i < (lines || 4); i++) {
        children.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: "", font: "Arial", size: 20 })] }));
    }
    return new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: [contentWidth],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders,
                        width: { size: contentWidth, type: WidthType.DXA },
                        shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                        margins: { top: 120, bottom: 120, left: 160, right: 160 },
                        children,
                    }),
                ],
            }),
        ],
    });
}

function twoColFields(label1, placeholder1, label2, placeholder2) {
    const colW = Math.floor(contentWidth / 2) - 40;
    return new Table({
        width: { size: contentWidth, type: WidthType.DXA },
        columnWidths: [colW + 40, colW + 40],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders: noBorders,
                        width: { size: colW + 40, type: WidthType.DXA },
                        margins: { top: 0, bottom: 0, left: 0, right: 80 },
                        children: [
                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: label1, font: "Arial", size: 22, bold: true, color: DARK })] }),
                            new Table({
                                width: { size: colW - 40, type: WidthType.DXA },
                                columnWidths: [colW - 40],
                                rows: [new TableRow({ children: [new TableCell({
                                    borders,
                                    width: { size: colW - 40, type: WidthType.DXA },
                                    shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                                    children: [new Paragraph({ children: [new TextRun({ text: placeholder1, font: "Arial", size: 20, color: "AAAAAA", italics: true })] })],
                                })] })],
                            }),
                        ],
                    }),
                    new TableCell({
                        borders: noBorders,
                        width: { size: colW + 40, type: WidthType.DXA },
                        margins: { top: 0, bottom: 0, left: 80, right: 0 },
                        children: [
                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: label2, font: "Arial", size: 22, bold: true, color: DARK })] }),
                            new Table({
                                width: { size: colW - 40, type: WidthType.DXA },
                                columnWidths: [colW - 40],
                                rows: [new TableRow({ children: [new TableCell({
                                    borders,
                                    width: { size: colW - 40, type: WidthType.DXA },
                                    shading: { fill: LIGHT_BG, type: ShadingType.CLEAR },
                                    margins: { top: 100, bottom: 100, left: 140, right: 140 },
                                    children: [new Paragraph({ children: [new TextRun({ text: placeholder2, font: "Arial", size: 20, color: "AAAAAA", italics: true })] })],
                                })] })],
                            }),
                        ],
                    }),
                ],
            }),
        ],
    });
}

function projectBlock(number) {
    return [
        new Paragraph({
            spacing: { before: 300, after: 120 },
            border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR, space: 6 } },
            children: [
                new TextRun({ text: `PROGETTO ${number}`, font: "Arial", size: 24, color: ACCENT, bold: true }),
            ],
        }),
        fieldLabel("Nome di fantasia del progetto"),
        fieldBox("Es: Residenza Aurelia, Progetto Alpha, Villa Meridiana..."),
        new Paragraph({ spacing: { before: 100 }, children: [] }),
        twoColFields("Categoria", "Residenziale / Commerciale / Restauro / Ristrutturazione", "Anno", "Es: 2024"),
        fieldLabel("Breve descrizione"),
        fieldBoxTall("Descrivi il progetto in 2-3 righe: tipo di intervento, dimensioni, particolarita...", 3),
        fieldLabel("Foto disponibili"),
        fieldBox("Indicare: foto cantiere / foto finito / render / prima e dopo / nessuna"),
    ];
}

// Build document
const doc = new Document({
    styles: {
        default: {
            document: {
                run: { font: "Arial", size: 22, color: DARK },
            },
        },
        paragraphStyles: [
            {
                id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 36, bold: true, font: "Arial", color: DARK },
                paragraph: { spacing: { before: 240, after: 200 }, outlineLevel: 0 },
            },
            {
                id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
                run: { size: 28, bold: true, font: "Arial", color: DARK },
                paragraph: { spacing: { before: 200, after: 160 }, outlineLevel: 1 },
            },
        ],
    },
    sections: [
        // ===== COVER PAGE =====
        {
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
            },
            children: [
                new Paragraph({ spacing: { before: 3000 }, children: [] }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 },
                    children: [
                        new TextRun({ text: "PILEGGI IMMOBILIARE", font: "Arial", size: 52, bold: true, color: DARK, characterSpacing: 300 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                    children: [
                        new TextRun({ text: "Progettazione ed Opere Edili", font: "Arial", size: 28, color: "666666", italics: true }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    border: { top: { style: BorderStyle.SINGLE, size: 2, color: ACCENT, space: 20 }, bottom: { style: BorderStyle.SINGLE, size: 2, color: ACCENT, space: 20 } },
                    spacing: { before: 400, after: 400 },
                    children: [
                        new TextRun({ text: "RACCOLTA TESTI E MATERIALI", font: "Arial", size: 36, bold: true, color: ACCENT }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 200, after: 100 },
                    children: [
                        new TextRun({ text: "PER LA REALIZZAZIONE DEL SITO WEB", font: "Arial", size: 24, color: "666666", characterSpacing: 200 }),
                    ],
                }),
                new Paragraph({ spacing: { before: 2000 }, children: [] }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 80 },
                    children: [
                        new TextRun({ text: "Documento preparato da ", font: "Arial", size: 20, color: "999999" }),
                        new TextRun({ text: "Refingo", font: "Arial", size: 20, color: ACCENT, bold: true }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: "Si prega di compilare tutti i campi e restituire il documento", font: "Arial", size: 20, color: "999999" }),
                    ],
                }),
            ],
        },
        // ===== MAIN CONTENT =====
        {
            properties: {
                page: {
                    size: { width: 12240, height: 15840 },
                    margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
                },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({ text: "Pileggi Immobiliare", font: "Arial", size: 16, color: "AAAAAA", italics: true }),
                                new TextRun({ text: "  |  Raccolta Testi Sito Web", font: "Arial", size: 16, color: "CCCCCC" }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR, space: 6 } },
                            children: [
                                new TextRun({ text: "Pagina ", font: "Arial", size: 16, color: "AAAAAA" }),
                                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "AAAAAA" }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                // INTRO
                new Paragraph({
                    spacing: { after: 120 },
                    children: [
                        new TextRun({ text: "COME COMPILARE QUESTO DOCUMENTO", font: "Arial", size: 26, bold: true, color: DARK }),
                    ],
                }),
                new Paragraph({
                    spacing: { after: 80 },
                    children: [
                        new TextRun({ text: "Compilate i campi grigi con i testi che desiderate sul sito. Se un campo non vi interessa, lasciatelo vuoto. Per le foto, potete inviarle separatamente via email o Google Drive indicando a quale progetto si riferiscono.", font: "Arial", size: 20, color: "555555" }),
                    ],
                }),
                new Paragraph({
                    spacing: { after: 300 },
                    children: [
                        new TextRun({ text: "I campi con ", font: "Arial", size: 20, color: "555555" }),
                        new TextRun({ text: "*", font: "Arial", size: 20, color: "CC0000", bold: true }),
                        new TextRun({ text: " sono obbligatori per la pubblicazione del sito.", font: "Arial", size: 20, color: "555555" }),
                    ],
                }),

                // ===== SEZIONE 1: HERO =====
                ...sectionHeader("1", "Hero (Homepage)"),
                instruction("Questa sezione appare per prima quando si apre il sito. Deve comunicare immediatamente chi siete."),
                fieldLabel("Tagline / Slogan principale *"),
                fieldBox("Es: Costruiamo il Futuro / Progettiamo i vostri sogni / ..."),
                fieldLabel("Sottotitolo descrittivo"),
                fieldBoxTall("Una frase che descrive cosa fate e il vostro approccio (2-3 righe)", 2),

                new Paragraph({ children: [new PageBreak()] }),

                // ===== SEZIONE 2: CHI SIAMO =====
                ...sectionHeader("2", "Chi Siamo"),
                instruction("Raccontateci la vostra storia e i vostri punti di forza. Questo testo aiuta i visitatori a capire perche scegliere voi."),
                fieldLabel("Testo di presentazione aziendale *"),
                fieldBoxTall("Chi siete, da quanto operate, in cosa siete specializzati, cosa vi distingue dalla concorrenza...", 6),
                fieldLabel("Citazione / Motto aziendale"),
                fieldBox("Una frase ad effetto che rappresenta la vostra filosofia"),
                fieldLabel("Statistiche aziendali"),
                instruction("Compilate i numeri che volete mostrare sul sito. Lasciate vuoto quelli che non vi interessano."),
                twoColFields("Anni di esperienza", "Es: 35", "Progetti completati", "Es: 520"),
                new Paragraph({ spacing: { before: 100 }, children: [] }),
                twoColFields("% Clienti soddisfatti", "Es: 98%", "Professionisti nel team", "Es: 150"),

                new Paragraph({ children: [new PageBreak()] }),

                // ===== SEZIONE 3: METODO =====
                ...sectionHeader("3", "Il Nostro Metodo"),
                instruction("Il sito mostra 4 fasi del vostro processo lavorativo. Potete modificare i nomi e le descrizioni o proporre fasi diverse."),
                fieldLabel("Fase 1 - Nome"),
                fieldBox("Es: Ascolto / Consulenza / Sopralluogo / ..."),
                fieldLabel("Fase 1 - Descrizione"),
                fieldBoxTall("Cosa succede in questa fase? (2-3 righe)", 2),
                fieldLabel("Fase 2 - Nome"),
                fieldBox("Es: Progettazione / Design / ..."),
                fieldLabel("Fase 2 - Descrizione"),
                fieldBoxTall("Cosa succede in questa fase? (2-3 righe)", 2),
                fieldLabel("Fase 3 - Nome"),
                fieldBox("Es: Realizzazione / Costruzione / ..."),
                fieldLabel("Fase 3 - Descrizione"),
                fieldBoxTall("Cosa succede in questa fase? (2-3 righe)", 2),
                fieldLabel("Fase 4 - Nome"),
                fieldBox("Es: Consegna / Collaudo / ..."),
                fieldLabel("Fase 4 - Descrizione"),
                fieldBoxTall("Cosa succede in questa fase? (2-3 righe)", 2),

                new Paragraph({ children: [new PageBreak()] }),

                // ===== SEZIONE 4: PROGETTI =====
                ...sectionHeader("4", "Progetti / Galleria"),
                instruction("Elencate i progetti che volete mostrare sul sito. Per la privacy dei clienti, useremo nomi di fantasia (es: Residenza Aurelia). Potete compilare da 3 a 8 progetti."),
                new Paragraph({
                    spacing: { before: 100, after: 200 },
                    shading: { fill: "FFF8E1", type: ShadingType.CLEAR },
                    children: [
                        new TextRun({ text: "  NOTA PRIVACY: ", font: "Arial", size: 20, bold: true, color: "B8860B" }),
                        new TextRun({ text: "I nomi reali dei clienti NON verranno pubblicati sul sito. Indicate il nome di fantasia che preferite o lo sceglieremo noi.", font: "Arial", size: 20, color: "8B7500" }),
                    ],
                }),
                ...projectBlock(1),
                ...projectBlock(2),
                ...projectBlock(3),

                new Paragraph({ children: [new PageBreak()] }),

                ...projectBlock(4),
                ...projectBlock(5),
                ...projectBlock(6),

                new Paragraph({ children: [new PageBreak()] }),

                // ===== SEZIONE 5: COLLABORA =====
                ...sectionHeader("5", "Collabora con Noi"),
                instruction("Questa sezione permette a potenziali collaboratori di inviarvi candidature con CV allegato."),
                fieldLabel("Testo di presentazione"),
                fieldBoxTall("Perche qualcuno dovrebbe lavorare con voi? Cosa offrite? (3-4 righe)", 4),
                fieldLabel("Valori / Punti di forza da evidenziare"),
                fieldBoxTall("Es: Formazione Continua, Crescita Professionale, Ambiente Meritocratico, Progetti Ambiziosi...", 2),

                new Paragraph({ children: [new PageBreak()] }),

                // ===== SEZIONE 6: CONTATTI =====
                ...sectionHeader("6", "Contatti"),
                instruction("Informazioni di contatto che appariranno sul sito. I campi con * sono obbligatori."),
                fieldLabel("Indirizzo sede *"),
                fieldBox("Via, numero civico, CAP, citta, provincia"),
                fieldLabel("Numero di telefono *"),
                fieldBox("Es: +39 0961 123 456"),
                fieldLabel("Email *"),
                fieldBox("Es: info@pileggiimmobiliare.it"),
                fieldLabel("Orari di apertura"),
                fieldBox("Es: Lun-Ven 08:00-18:00, Sab 09:00-13:00"),

                // ===== SEZIONE 7: SOCIAL =====
                ...sectionHeader("7", "Social e Footer"),
                instruction("Link ai vostri profili social. Verranno mostrati nel footer del sito con le relative icone."),
                fieldLabel("Link pagina Instagram"),
                fieldBox("Es: https://instagram.com/pileggiimmobiliare"),
                fieldLabel("Link pagina Facebook"),
                fieldBox("Es: https://facebook.com/pileggiimmobiliare"),
                fieldLabel("Altri social (opzionale)"),
                fieldBox("LinkedIn, YouTube, TikTok, altro..."),

                new Paragraph({ children: [new PageBreak()] }),

                // ===== SEZIONE 8: MATERIALE =====
                ...sectionHeader("8", "Materiale Aggiuntivo"),
                instruction("Indicate quale materiale potete fornirci. Inviatelo via Google Drive o email."),

                new Table({
                    width: { size: contentWidth, type: WidthType.DXA },
                    columnWidths: [5500, 1930, 1930],
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    borders,
                                    width: { size: 5500, type: WidthType.DXA },
                                    shading: { fill: ACCENT, type: ShadingType.CLEAR },
                                    margins: cellMargins,
                                    children: [new Paragraph({ children: [new TextRun({ text: "Materiale", font: "Arial", size: 20, bold: true, color: WHITE })] })],
                                }),
                                new TableCell({
                                    borders,
                                    width: { size: 1930, type: WidthType.DXA },
                                    shading: { fill: ACCENT, type: ShadingType.CLEAR },
                                    margins: cellMargins,
                                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Disponibile?", font: "Arial", size: 20, bold: true, color: WHITE })] })],
                                }),
                                new TableCell({
                                    borders,
                                    width: { size: 1930, type: WidthType.DXA },
                                    shading: { fill: ACCENT, type: ShadingType.CLEAR },
                                    margins: cellMargins,
                                    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Note", font: "Arial", size: 20, bold: true, color: WHITE })] })],
                                }),
                            ],
                        }),
                        ...["Logo in alta risoluzione (PNG/SVG)", "Foto del team / staff", "Foto dei cantieri in corso", "Foto dei lavori completati", "Foto prima/dopo ristrutturazioni", "Render / disegni di progettazione", "Video dei cantieri o time-lapse", "Documenti PDF da linkare (certificazioni, ecc.)"].map((item, i) =>
                            new TableRow({
                                children: [
                                    new TableCell({
                                        borders,
                                        width: { size: 5500, type: WidthType.DXA },
                                        shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR },
                                        margins: cellMargins,
                                        children: [new Paragraph({ children: [new TextRun({ text: item, font: "Arial", size: 20, color: DARK })] })],
                                    }),
                                    new TableCell({
                                        borders,
                                        width: { size: 1930, type: WidthType.DXA },
                                        shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR },
                                        margins: cellMargins,
                                        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: item.includes("Logo") ? "SI" : "", font: "Arial", size: 20, color: item.includes("Logo") ? "2E7D32" : "AAAAAA", bold: item.includes("Logo") })] })],
                                    }),
                                    new TableCell({
                                        borders,
                                        width: { size: 1930, type: WidthType.DXA },
                                        shading: { fill: i % 2 === 0 ? WHITE : LIGHT_BG, type: ShadingType.CLEAR },
                                        margins: cellMargins,
                                        children: [new Paragraph({ children: [new TextRun({ text: item.includes("Logo") ? "Gia fornito" : "", font: "Arial", size: 18, color: "999999", italics: true })] })],
                                    }),
                                ],
                            })
                        ),
                    ],
                }),

                new Paragraph({ spacing: { before: 400 }, children: [] }),
                new Paragraph({
                    spacing: { before: 200, after: 100 },
                    alignment: AlignmentType.CENTER,
                    border: { top: { style: BorderStyle.SINGLE, size: 2, color: ACCENT, space: 12 } },
                    children: [
                        new TextRun({ text: "Grazie per la collaborazione!", font: "Arial", size: 24, color: ACCENT, bold: true }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                        new TextRun({ text: "Una volta compilato, inviate questo documento a ", font: "Arial", size: 20, color: "666666" }),
                        new TextRun({ text: "Refingo", font: "Arial", size: 20, color: ACCENT, bold: true }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: "insieme al materiale fotografico tramite Google Drive o email.", font: "Arial", size: 20, color: "666666" }),
                    ],
                }),
            ],
        },
    ],
});

const outputPath = process.argv[2] || "raccolta-testi-pileggi.docx";
Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(outputPath, buffer);
    console.log("Documento creato: " + outputPath);
});
