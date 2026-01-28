const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

describe('Inventory Tracker - Tally View', () => {
    let dom;
    let document;
    let window;

    before(() => {
        const html = fs.readFileSync(
            path.join(__dirname, '..', 'inventorytracker.html'),
            'utf-8'
        );
        dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable' });
        document = dom.window.document;
        window = dom.window;
    });

    it('should have the Quick Tally view container', () => {
        const tallyView = document.getElementById('view-sales');
        expect(tallyView).to.exist;
    });

    it('should have the tally container element', () => {
        const tallyContainer = document.getElementById('tally-container');
        expect(tallyContainer).to.exist;
    });

    it('should have tally-item class defined in styles', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        expect(styleContent).to.include('.tally-item');
    });

    it('should have tally-item-name class defined in styles', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        expect(styleContent).to.include('.tally-item-name');
        expect(styleContent).to.include('font-size: 18px'); // Larger font for accessibility
    });

    it('should have checkbox-tally class defined in styles', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        expect(styleContent).to.include('.checkbox-tally');
    });

    it('should have checkbox-box class defined in styles', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        expect(styleContent).to.include('.checkbox-box');
        expect(styleContent).to.include('28px'); // Size specification
    });

    it('should have print-specific styles for checkboxes', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        expect(styleContent).to.include('@media print');
        expect(styleContent).to.include('.checkbox-tally');
    });

    it('should have digital tally button styles', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        expect(styleContent).to.include('.tally-btn');
        expect(styleContent).to.include('44px'); // Button size for accessibility
    });

    it('should have the toggleCheckbox function defined', () => {
        const scripts = Array.from(document.querySelectorAll('script'))
            .map(s => s.textContent)
            .join('\n');
        expect(scripts).to.include('function toggleCheckbox');
    });

    it('should have the renderTally function that creates 16 checkboxes', () => {
        const scripts = Array.from(document.querySelectorAll('script'))
            .map(s => s.textContent)
            .join('\n');
        expect(scripts).to.include('function renderTally');
        expect(scripts).to.include('Array.from({length: 16}');
        expect(scripts).to.include('checkbox-box');
    });

    it('should have two tally options in renderTally', () => {
        const scripts = Array.from(document.querySelectorAll('script'))
            .map(s => s.textContent)
            .join('\n');
        expect(scripts).to.include('Digital Tally');
        expect(scripts).to.include('Print Tally');
    });

    it('should have no-print class for digital controls', () => {
        const scripts = Array.from(document.querySelectorAll('script'))
            .map(s => s.textContent)
            .join('\n');
        expect(scripts).to.include('no-print'); // Digital tally controls shouldn't print
    });

    it('should have accessibility-friendly sizing', () => {
        const styleContent = Array.from(document.querySelectorAll('style'))
            .map(s => s.textContent)
            .join('\n');
        // Check for larger, more readable font sizes
        expect(styleContent).to.include('font-size: 18px'); // Item names
        expect(styleContent).to.include('font-size: 24px'); // Count display
    });
});
