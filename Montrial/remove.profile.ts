// Explicitly name it 'index' to make the array utility clear
onRemove(profile: any, index: number): void {
    console.log('Removing item at index:', index);
  
    if (index !== undefined && index > -1) {
      // 1. Splice directly using the verified array position index
      this.deleteByIndex(this.selectedProfiles, index);
      
      // 2. Sync down your banking cache layers
      if (this.selectedProfiles.length === 0) {
        this.removeCachedItems('profilesSelected');
        this.clearCache();
      } else {
        // Keep your remaining entries synchronized in local cache storage
        this.saveToCache('profilesSelected', this.selectedProfiles);
      }
      
      // 3. Force change detection layout pass to notify the host view
      this.cdr.detectChanges();
    }
  }
  
  // Ensure your helper matching parameters look clean:
  deleteByIndex(arr: any[], index: number): any[] {
    if (index > -1 && index < arr.length) {
      arr.splice(index, 1);
    }
    return arr;
  }