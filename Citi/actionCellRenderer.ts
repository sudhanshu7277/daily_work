actionCellRenderer(params: any): HTMLElement {
    const button = document.createElement('button');
    button.className = 'action-btn-edit';
    button.innerText = 'Edit';
  
    // Inline styles to match your original (or move to CSS if preferred)
    button.style.background = '#007bff';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.padding = '4px 10px';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
  
    // Safe event listener
    button.addEventListener('click', () => {
      if (params?.data) {
        this.openEditModal(params.data);
      }
    });
  
    return button;
  }

  {
    headerName: 'Actions',
    width: 100,
    pinned: 'right',
    cellRenderer: this.actionCellRenderer.bind(this),  // Bind to keep 'this' context
  },