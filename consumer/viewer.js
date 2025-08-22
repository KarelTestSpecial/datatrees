document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const accordionContainer = document.getElementById('accordion-container');

    let nodeIdCounter = 1; // Simple ID generator

    /**
     * Parses text with indented lines into a hierarchical node structure.
     * @param {string} text - The input text to parse.
     * @returns {Array} An array of root nodes.
     */
    function parseTxtToNodes(text) {
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1); // Handle BOM
        }

        const lines = text.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const getIndentLevel = (line) => {
            const match = line.match(/^\t*/);
            return match ? match[0].length : 0;
        };

        const rootNodes = [];
        const parentStack = []; // Stack to keep track of parent nodes

        lines.forEach(line => {
            const level = getIndentLevel(line);
            const title = line.trim();

            const newNode = {
                id: nodeIdCounter++,
                title: title,
                children: [],
                level: level,
                isOpen: true // All nodes are open by default in the viewer
            };

            while (parentStack.length > 0 && level <= parentStack[parentStack.length - 1].level) {
                parentStack.pop();
            }

            const parent = parentStack.length > 0 ? parentStack[parentStack.length - 1] : null;

            if (parent) {
                parent.children.push(newNode);
            } else {
                rootNodes.push(newNode);
            }

            parentStack.push(newNode);
        });

        return rootNodes;
    }

    /**
     * Creates an HTML element for a single accordion node.
     * @param {object} node - The node data.
     * @param {Array} breadcrumb - The path of titles from the root to the current node.
     * @returns {HTMLElement} The created accordion item element.
     */
    function createNodeElement(node, breadcrumb = []) {
        const currentBreadcrumb = [...breadcrumb, node.title];

        const item = document.createElement('div');
        item.className = 'accordion-item';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'accordion-title';

        const toggle = document.createElement('span');
        toggle.className = 'accordion-toggle';
        toggle.textContent = node.isOpen ? '−' : '+';
        if (node.children.length === 0) {
            toggle.style.visibility = 'hidden'; // Hide toggle if no children
        }

        const titleText = document.createElement('span');
        titleText.className = 'title-text';
        titleText.textContent = node.title;
        titleText.dataset.breadcrumb = JSON.stringify(currentBreadcrumb);

        titleDiv.appendChild(toggle);
        titleDiv.appendChild(titleText);

        item.appendChild(titleDiv);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';
        if (!node.isOpen) {
            contentDiv.classList.add('hidden');
        }

        if (node.children && node.children.length > 0) {
            const nestedContainer = document.createElement('div');
            nestedContainer.className = 'nested-accordion';
            node.children.forEach(childNode => {
                nestedContainer.appendChild(createNodeElement(childNode, currentBreadcrumb));
            });
            contentDiv.appendChild(nestedContainer);
        }

        item.appendChild(contentDiv);

        return item;
    }

    /**
     * Renders the entire accordion from the node data.
     * @param {Array} nodes - The array of root nodes.
     */
    function render(nodes) {
        accordionContainer.innerHTML = '';
        if (nodes.length === 0) {
            accordionContainer.textContent = 'Geen data om weer te geven. Selecteer een bestand.';
            return;
        }
        nodes.forEach(node => {
            accordionContainer.appendChild(createNodeElement(node));
        });
    }

    // --- EVENT LISTENERS ---

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const nodes = parseTxtToNodes(e.target.result);
                render(nodes);
            } catch (error) {
                console.error('Error parsing file:', error);
                accordionContainer.textContent = 'Fout bij het lezen van het bestand. Zorg ervoor dat het een correct geformatteerd .txt-bestand is.';
            }
        };
        reader.readAsText(file);
    });

    accordionContainer.addEventListener('click', (e) => {
        const titleText = e.target.closest('.title-text');
        const toggle = e.target.closest('.accordion-toggle');

        if (titleText) {
            const breadcrumb = JSON.parse(titleText.dataset.breadcrumb);
            const searchQuery = breadcrumb.join(' ');
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(googleUrl, '_blank');
        }

        if (toggle) {
            const contentDiv = toggle.parentElement.nextElementSibling;
            const isHidden = contentDiv.classList.toggle('hidden');
            toggle.textContent = isHidden ? '+' : '−';
        }
    });

    // Initial render
    render([]);
});
