# Hierarchical Knowledge Base Builder & Viewer

This project provides a suite of tools to build, manage, and view hierarchical knowledge structures. It is composed of two distinct web applications: the **Maker App** and the **Consumer App**.

## Project Structure

The project is organized into two main directories:

-   `/maker/`: Contains the **Maker App**, a full-featured application for creating, editing, and exporting knowledge hierarchies.
-   `/consumer/`: Contains the **Consumer App**, a lightweight, read-only application for importing and browsing these hierarchies.

## Data Format

The data is exchanged between the two applications using a simple `.txt` file format. The hierarchy is represented using tabs for indentation. Each line in the file represents a node.

**Example:**
```
Main Topic
	Sub-Topic 1
		Detail A
		Detail B
	Sub-Topic 2
```

---

## How to Use

### Maker App (`/maker/index.html`)

The Maker App is a powerful tool for building your knowledge base from scratch or by importing an existing `.txt` file.

**Features:**

*   **Create & Edit:**
    *   Add nodes at the root level or as children of existing nodes.
    *   Edit the title and content of any node.
    *   Delete nodes (which also deletes all their children).
*   **Drag-and-Drop:**
    *   Easily reorganize your hierarchy by dragging and dropping nodes.
    *   You can move a node to be a sibling of another (by dropping it near the top or bottom of the target) or make it a child (by dropping it in the middle of the target).
*   **Google Search Integration:**
    *   Click on any node's title to open a new browser tab with a Google search. The search query is automatically constructed from the full "breadcrumb path" of the node.
*   **Import/Export:**
    *   **Import TXT:** Load an existing `.txt` file (using the format described above) to populate the editor.
    *   **Export TXT:** Save your current hierarchy to a `.txt` file, which can be shared or viewed with the Consumer App.
*   **Persistence:** Your work is automatically saved in your browser's local storage, so you won't lose it if you refresh the page.

### Consumer App (`/consumer/viewer.html`)

The Consumer App provides a clean, read-only interface for browsing a knowledge base.

**Features:**

*   **Import & View:**
    *   Select a `.txt` file to instantly render it as a collapsible accordion.
*   **Easy Navigation:**
    *   Expand and collapse nodes to navigate the hierarchy.
*   **Google Search Integration:**
    *   Just like in the Maker App, click any node's title to perform a contextual Google search in a new tab.
