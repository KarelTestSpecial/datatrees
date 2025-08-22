document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const accordionContainer = document.getElementById('accordion-container');
    const addRootNodeBtn = document.getElementById('add-root-node-btn');
    const addChildBtn = document.getElementById('add-child-btn');
    const editTitleBtn = document.getElementById('edit-title-btn');
    const editContentBtn = document.getElementById('edit-content-btn');
    const deleteNodeBtn = document.getElementById('delete-node-btn');
    const exportBtn = document.getElementById('export-btn');
    const importFile = document.getElementById('import-file');
    const importTxtFile = document.getElementById('import-txt-file');

    // --- STATE MANAGEMENT ---
    let state = {
        nodes: [],
        selectedNodeId: null,
        nextId: 1,
        openNodes: new Set()
    };

    // --- DATA PERSISTENCE ---
    function saveState() {
        const stateToSave = { ...state, openNodes: Array.from(state.openNodes) };
        localStorage.setItem('accordionState', JSON.stringify(stateToSave));
    }

    function loadState() {
        const savedState = localStorage.getItem('accordionState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            if (parsedState.nodes) {
                fixMissingStateProperties(parsedState.nodes);
            }
            parsedState.openNodes = new Set(parsedState.openNodes);
            state = parsedState;
        }
    }

    function fixMissingStateProperties(nodes) {
        nodes.forEach(node => {
            if (node.contentVisible === undefined) node.contentVisible = false;
            if (node.content === undefined) node.content = `Inhoud van ${node.title}.`;
            if (node.children) fixMissingStateProperties(node.children);
        });
    }

    // --- DOM RENDERING ---
    function render() {
        accordionContainer.innerHTML = '';
        state.nodes.forEach(node => {
            accordionContainer.appendChild(createNodeElement(node, []));
        });
        updateActionButtons();
    }

    function createNodeElement(node, breadcrumb) {
        const isSelected = node.id === state.selectedNodeId;
        const isAccordionOpen = state.openNodes.has(node.id);
        const isContentVisible = node.contentVisible === true;
        const currentBreadcrumb = [...breadcrumb, node.title];

        const item = document.createElement('div');
        item.className = `accordion-item ${isSelected ? 'selected' : ''}`;
        item.dataset.id = node.id;
        item.draggable = true;

        // --- Build Title Div ---
        const titleDiv = document.createElement('div');
        titleDiv.className = 'accordion-title';

        const contentToggleBtn = document.createElement('button');
        contentToggleBtn.className = 'content-toggle-btn';
        contentToggleBtn.textContent = '>';
        if (isContentVisible) contentToggleBtn.classList.add('open');

        const titleText = document.createElement('span');
        titleText.className = 'title-text';
        titleText.textContent = node.title;
        titleText.dataset.breadcrumb = JSON.stringify(currentBreadcrumb);


        const accordionToggleBtn = document.createElement('span');
        accordionToggleBtn.className = 'accordion-toggle-btn';
        accordionToggleBtn.textContent = isAccordionOpen ? '-' : '+';

        titleDiv.appendChild(contentToggleBtn);
        titleDiv.appendChild(titleText);
        titleDiv.appendChild(accordionToggleBtn);

        // --- Build Content Div ---
        const contentDiv = document.createElement('div');
        contentDiv.className = 'accordion-content';
        if (!isAccordionOpen) contentDiv.classList.add('hidden');

        const contentArea = document.createElement('div');
        contentArea.className = 'content-area';

        const contentParagraph = document.createElement('p');
        contentParagraph.textContent = node.content;
        if (!isContentVisible) contentParagraph.classList.add('hidden');

        contentArea.appendChild(contentParagraph); // No button here anymore

        const nestedContainer = document.createElement('div');
        nestedContainer.className = 'nested-accordion';

        if (node.children && node.children.length > 0) {
            node.children.forEach(childNode => {
                nestedContainer.appendChild(createNodeElement(childNode, currentBreadcrumb));
            });
        }

        contentDiv.appendChild(contentArea);
        contentDiv.appendChild(nestedContainer);
        item.appendChild(titleDiv);
        item.appendChild(contentDiv);

        return item;
    }

    // --- UI & ACTION HELPERS ---
    function updateActionButtons() {
        const isNodeSelected = state.selectedNodeId !== null;
        addChildBtn.disabled = !isNodeSelected;
        editTitleBtn.disabled = !isNodeSelected;
        editContentBtn.disabled = !isNodeSelected;
        deleteNodeBtn.disabled = !isNodeSelected;
    }

    function parseTxtToNodes(text) {
        // Handle potential Byte Order Mark (BOM) at the start of the file
        if (text.charCodeAt(0) === 0xFEFF) {
            text = text.slice(1);
        }

        // Normalize line endings and filter out empty or whitespace-only lines
        const lines = text.replace(/\r\n/g, '\n').split('\n').filter(line => line.trim() !== '');
        if (lines.length === 0) return [];

        const getIndentLevel = (line) => {
            // Use a regex to count leading spaces. This is more robust than checking characters.
            const match = line.match(/^( |\t)*/);
            // Let's assume a tab is 4 spaces for consistency, though the source file uses spaces.
            return match ? match[0].replace(/\t/g, '    ').length : 0;
        };

        const rootNodes = [];
        const parentStack = []; // A stack to keep track of parent nodes at each level

        lines.forEach(line => {
            const indentLevel = getIndentLevel(line);
            const title = line.trim();
            const newNode = {
                id: state.nextId++,
                title: title,
                children: [],
                content: `Inhoud voor ${title}.`,
                contentVisible: false
            };

            // Pop from the stack until we find the correct parent for the current indent level
            while (parentStack.length > 0 && indentLevel <= parentStack[parentStack.length - 1].indent) {
                parentStack.pop();
            }

            if (parentStack.length === 0) {
                // This is a root node
                rootNodes.push(newNode);
            } else {
                // This is a child node
                const parent = parentStack[parentStack.length - 1].node;
                parent.children.push(newNode);
            }

            // Push the current node onto the stack to act as a potential parent for subsequent nodes
            parentStack.push({ node: newNode, indent: indentLevel });
        });

        return rootNodes;
    }

    function findNodeById(nodes, id) {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNodeById(node.children, id);
                if (found) return found;
            }
        }
        return null;
    }

    function deleteNodeRecursive(nodes, id) {
        return nodes.filter(node => {
            if (node.id === id) return false;
            if (node.children) node.children = deleteNodeRecursive(node.children, id);
            return true;
        });
    }

    function findNodeAndParent(nodes, id, parent = null) {
        for (const node of nodes) {
            if (node.id === id) {
                return { node, parent };
            }
            if (node.children) {
                const found = findNodeAndParent(node.children, id, node);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    }

    function nodesToTxt(nodes, level = 0) {
        let txt = '';
        nodes.forEach(node => {
            txt += '\t'.repeat(level) + node.title + '\n';
            if (node.children && node.children.length > 0) {
                txt += nodesToTxt(node.children, level + 1);
            }
        });
        return txt;
    }

    function exportToTxt() {
        if (state.nodes.length === 0) {
            alert("Er is geen data om te exporteren.");
            return;
        }
        const txtContent = nodesToTxt(state.nodes);
        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'export.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // --- EVENT LISTENERS ---
    addRootNodeBtn.addEventListener('click', () => {
        const title = prompt("Voer de titel voor de nieuwe hoofd node in:", `Node ${state.nextId}`);
        if (title) {
            const newNode = {
                id: state.nextId++,
                title: title,
                children: [],
                contentVisible: false,
                content: `Inhoud van ${title}.`
            };
            state.nodes.push(newNode);
            saveState();
            render();
        }
    });

    addChildBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        const title = prompt("Voer de titel voor de nieuwe kind node in:", `Kind Node ${state.nextId}`);
        if (title) {
            const parentNode = findNodeById(state.nodes, state.selectedNodeId);
            if (parentNode) {
                if (!parentNode.children) parentNode.children = [];
                const newNode = {
                    id: state.nextId++,
                    title: title,
                    children: [],
                    contentVisible: false,
                    content: `Inhoud van ${title}.`
                };
                parentNode.children.push(newNode);
                state.openNodes.add(parentNode.id);
                saveState();
                render();
            }
        }
    });

    editTitleBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        const node = findNodeById(state.nodes, state.selectedNodeId);
        if (node) {
            const newTitle = prompt("Voer de nieuwe titel in:", node.title);
            if (newTitle && newTitle.trim()) {
                node.title = newTitle.trim();
                saveState();
                render();
            }
        }
    });

    editContentBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        const node = findNodeById(state.nodes, state.selectedNodeId);
        if (node) {
            const newContent = prompt("Voer de nieuwe inhoud in:", node.content);
            if (newContent !== null) {
                node.content = newContent;
                saveState();
                render();
            }
        }
    });

    exportBtn.addEventListener('click', exportToTxt);

    importFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedState = JSON.parse(e.target.result);
                // Basic validation
                if (importedState && Array.isArray(importedState.nodes) && importedState.openNodes) {
                    // Convert openNodes back to a Set
                    importedState.openNodes = new Set(importedState.openNodes);
                    state = importedState;
                    saveState();
                    render();
                    alert('Data succesvol geïmporteerd!');
                } else {
                    throw new Error('Ongeldig bestandsformaat.');
                }
            } catch (error) {
                alert(`Fout bij het importeren van het bestand: ${error.message}`);
            }
        };
        reader.readAsText(file);

        // Reset file input so the same file can be loaded again
        event.target.value = '';
    });

    importTxtFile.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const textContent = e.target.result;
                const newNodes = parseTxtToNodes(textContent);
                if (newNodes.length > 0) {
                    state.nodes = newNodes;
                    state.openNodes.clear(); // Clear open nodes as the structure is new
                    state.selectedNodeId = null; // Deselect any node
                    saveState();
                    render();
                    alert('TXT-bestand succesvol geïmporteerd!');
                } else {
                    throw new Error('Kon geen nodes uit het bestand parsen.');
                }
            } catch (error) {
                alert(`Fout bij het importeren van het TXT-bestand: ${error.message}`);
            }
        };
        reader.readAsText(file);

        event.target.value = ''; // Reset file input
    });

    deleteNodeBtn.addEventListener('click', () => {
        if (state.selectedNodeId === null) return;
        if (confirm('Weet je zeker dat je deze node en alle kinderen wilt verwijderen?')) {
            state.nodes = deleteNodeRecursive(state.nodes, state.selectedNodeId);
            state.openNodes.delete(state.selectedNodeId);
            state.selectedNodeId = null;
            saveState();
            render();
        }
    });

    accordionContainer.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.accordion-item');
        if (!itemElement) return;

        const id = parseInt(itemElement.dataset.id, 10);

        const titleText = e.target.closest('.title-text');
        if (titleText) {
            e.stopPropagation(); // Prevent other click handlers on the title div
            const breadcrumb = JSON.parse(titleText.dataset.breadcrumb);
            const searchQuery = breadcrumb.join(' ');
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
            window.open(googleUrl, '_blank');
        }

        state.selectedNodeId = id;

        if (e.target.closest('.content-toggle-btn')) {
            const node = findNodeById(state.nodes, id);
            if (node) node.contentVisible = !node.contentVisible;
        } else if (e.target.closest('.accordion-title')) {
            if (state.openNodes.has(id)) {
                state.openNodes.delete(id);
            } else {
                state.openNodes.add(id);
            }
        }

        saveState();
        render();
    });

    // --- DRAG AND DROP LOGIC ---
    let draggedNodeId = null;

    function clearDropIndicators() {
        document.querySelectorAll('.drag-over, .drop-as-child').forEach(el => {
            el.classList.remove('drag-over', 'drop-as-child');
        });
    }

    accordionContainer.addEventListener('dragstart', (e) => {
        const itemElement = e.target.closest('.accordion-item');
        if (itemElement) {
            draggedNodeId = parseInt(itemElement.dataset.id, 10);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => itemElement.classList.add('dragging'), 0);
        }
    });

    accordionContainer.addEventListener('dragend', (e) => {
        clearDropIndicators();
        const draggedElement = document.querySelector('.dragging');
        if (draggedElement) {
            draggedElement.classList.remove('dragging');
        }
        draggedNodeId = null;
    });

    accordionContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        const targetElement = e.target.closest('.accordion-item');
        if (!targetElement || parseInt(targetElement.dataset.id, 10) === draggedNodeId) {
            return;
        }

        clearDropIndicators();

        const rect = targetElement.getBoundingClientRect();
        const dropY = e.clientY - rect.top;
        const height = rect.height;

        // Thresholds for top/bottom drop zones (e.g., 25% of the height)
        const threshold = height * 0.25;

        if (dropY < threshold) {
            targetElement.classList.add('drag-over'); // Drop before
        } else if (dropY > height - threshold) {
            targetElement.classList.add('drag-over'); // Drop after
        } else {
            targetElement.classList.add('drop-as-child'); // Drop onto
        }
    });

    accordionContainer.addEventListener('dragleave', (e) => {
        // Only remove if the mouse truly leaves the element, not just moving over children
        if (e.target.closest('.accordion-item')) {
             e.target.closest('.accordion-item').classList.remove('drag-over', 'drop-as-child');
        }
    });

    accordionContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedNodeId === null) return;

        const dropTargetElement = e.target.closest('.accordion-item');
        clearDropIndicators();

        if (!dropTargetElement) return;

        const targetNodeId = parseInt(dropTargetElement.dataset.id, 10);
        if (draggedNodeId === targetNodeId) return;

        const dragged = findNodeAndParent(state.nodes, draggedNodeId);
        const target = findNodeAndParent(state.nodes, targetNodeId);

        if (!dragged || !target) return;

        // Prevent dropping a parent into its own child
        let p = target.parent;
        while (p) {
            if (p.id === dragged.node.id) return;
            const found = findNodeAndParent(state.nodes, p.id);
            p = found ? found.parent : null;
        }

        // Remove node from its original location
        const sourceList = dragged.parent ? dragged.parent.children : state.nodes;
        const draggedNodeIndex = sourceList.findIndex(n => n.id === draggedNodeId);
        sourceList.splice(draggedNodeIndex, 1);

        // --- New Drop Logic ---
        const rect = dropTargetElement.getBoundingClientRect();
        const dropY = e.clientY - rect.top;
        const height = rect.height;
        const threshold = height * 0.25;

        const targetList = target.parent ? target.parent.children : state.nodes;
        const targetNodeIndex = targetList.findIndex(n => n.id === targetNodeId);

        if (dropY < threshold) {
            // Drop Before
            targetList.splice(targetNodeIndex, 0, dragged.node);
        } else if (dropY > height - threshold) {
            // Drop After
            targetList.splice(targetNodeIndex + 1, 0, dragged.node);
        } else {
            // Drop As Child
            if (!target.node.children) {
                target.node.children = [];
            }
            target.node.children.push(dragged.node);
            state.openNodes.add(target.node.id); // Open the parent node
        }

        saveState();
        render();
    });


    // --- INITIALIZATION ---
    loadState();
    render();
});
