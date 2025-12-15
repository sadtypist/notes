import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Converts HTML content to plain text
 */
const htmlToPlainText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
};

/**
 * Parses HTML content into structured elements for DOCX
 */
const parseHtmlForDocx = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const paragraphs = [];

    const processNode = (node, formatting = {}) => {
        const runs = [];

        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.trim()) {
                runs.push(new TextRun({
                    text: node.textContent,
                    bold: formatting.bold,
                    italics: formatting.italic,
                    underline: formatting.underline ? {} : undefined,
                    subScript: formatting.subscript,
                    superScript: formatting.superscript,
                }));
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();

            // Update formatting based on tag
            const newFormatting = { ...formatting };
            if (tagName === 'b' || tagName === 'strong') newFormatting.bold = true;
            if (tagName === 'i' || tagName === 'em') newFormatting.italic = true;
            if (tagName === 'u') newFormatting.underline = true;
            if (tagName === 'sub') newFormatting.subscript = true;
            if (tagName === 'sup') newFormatting.superscript = true;

            // Process children
            for (const child of node.childNodes) {
                runs.push(...processNode(child, newFormatting));
            }
        }

        return runs;
    };

    // Process each top-level element
    const childNodes = tempDiv.childNodes;
    for (const node of childNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            if (tagName === 'br') {
                paragraphs.push(new Paragraph({ children: [] }));
            } else if (tagName === 'div' || tagName === 'p') {
                const runs = processNode(node);
                if (runs.length > 0) {
                    paragraphs.push(new Paragraph({ children: runs }));
                }
            } else {
                // Handle inline elements at top level
                const runs = processNode(node);
                if (runs.length > 0) {
                    paragraphs.push(new Paragraph({ children: runs }));
                }
            }
        } else if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: node.textContent })]
            }));
        }
    }

    // If no paragraphs were created, create one from full text
    if (paragraphs.length === 0) {
        const text = htmlToPlainText(html);
        if (text) {
            text.split('\n').forEach(line => {
                paragraphs.push(new Paragraph({
                    children: [new TextRun({ text: line })]
                }));
            });
        }
    }

    return paragraphs;
};

/**
 * Export note as PDF
 */
export const exportAsPDF = (title, content) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);

    // Add title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(title || 'Untitled Note', margin, 30);

    // Add content
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const plainText = htmlToPlainText(content);
    const lines = doc.splitTextToSize(plainText, maxWidth);

    let yPosition = 50;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.getHeight();

    lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
    });

    // Save the PDF - sanitize filename but keep spaces and common chars
    const sanitizedTitle = (title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '').trim();
    doc.save(`${sanitizedTitle}.pdf`);
};

/**
 * Export note as DOCX
 */
export const exportAsDOCX = async (title, content) => {
    // Create title paragraph
    const titleParagraph = new Paragraph({
        children: [
            new TextRun({
                text: title || 'Untitled Note',
                bold: true,
                size: 48, // 24pt
            }),
        ],
        spacing: { after: 400 },
    });

    // Parse content to paragraphs
    const contentParagraphs = parseHtmlForDocx(content);

    // Create document
    const doc = new Document({
        sections: [{
            properties: {},
            children: [titleParagraph, ...contentParagraphs],
        }],
    });

    // Generate and save - sanitize filename but keep spaces and common chars
    const blob = await Packer.toBlob(doc);
    const sanitizedTitle = (title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '').trim();
    saveAs(blob, `${sanitizedTitle}.docx`);
};

/**
 * Export note as TXT
 */
export const exportAsTXT = (title, content) => {
    const plainText = htmlToPlainText(content);
    const fullText = `${title || 'Untitled Note'}\n${'='.repeat(title?.length || 13)}\n\n${plainText}`;

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    // Sanitize filename but keep spaces and common chars
    const sanitizedTitle = (title || 'Untitled Note').replace(/[<>:"/\\|?*]/g, '').trim();
    saveAs(blob, `${sanitizedTitle}.txt`);
};
