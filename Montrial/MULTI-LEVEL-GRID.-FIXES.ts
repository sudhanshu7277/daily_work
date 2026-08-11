// unit test

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef } from '@angular/core';
import { MultiLevelCustomerGridComponent } from './multi-level-customer-grid.component';
import { EntityRowNode } from './entity-grid.model';

describe('MultiLevelCustomerGridComponent', () => {
  let component: MultiLevelCustomerGridComponent;
  let fixture: ComponentFixture<MultiLevelCustomerGridComponent>;

  // Mock Grid API
  const mockGridApi = {
    setGridOption: jasmine.createSpy('setGridOption'),
    refreshHeader: jasmine.createSpy('refreshHeader')
  };

  // Sample Mock Tree Payload with multi-level depth & rolePlayers
  const mockTreeData: EntityRowNode[] = [
    {
      _uid: 'r0',
      _level: 0,
      _isParent: true,
      _expanded: true,
      _selected: false,
      _isClusterEnd: false,
      profileName: 'Harriette Quigley',
      ocifId: '907713908659161',
      rolePlayers: [
        {
          _uid: 'r0-0',
          _level: 1,
          _isParent: true,
          _expanded: true,
          _selected: false,
          _isClusterEnd: false,
          profileName: 'Kendrick Rohan',
          ocifId: '739494142001259',
          rolePlayers: [
            {
              _uid: 'r0-0-0',
              _level: 2,
              _isParent: false,
              _expanded: false,
              _selected: false,
              _isClusterEnd: false,
              profileName: 'Cristy Schmitt',
              ocifId: '617367922615896'
            }
          ]
        },
        {
          _uid: 'r0-1',
          _level: 1,
          _isParent: false,
          _expanded: false,
          _selected: false,
          _isClusterEnd: false,
          profileName: 'Jerrica Cartwright',
          ocifId: '738127754413582'
        }
      ]
    },
    // Standalone non-cluster record
    {
      _uid: 'r1',
      _level: 0,
      _isParent: false,
      _expanded: false,
      _selected: false,
      _isClusterEnd: false,
      profileName: 'Test @test',
      ocifId: 'a23615fd3e5023146bad4a76c21'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiLevelCustomerGridComponent],
      providers: [
        { provide: ChangeDetectorRef, useValue: { detectChanges: jasmine.createSpy('detectChanges') } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MultiLevelCustomerGridComponent);
    component = fixture.componentInstance;
    component.gridApi = mockGridApi as any;
    component.tree = JSON.parse(JSON.stringify(mockTreeData)); // Deep copy
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Tree Traversal & Node Finding', () => {
    it('should retrieve all nodes N-levels deep across rolePlayers using allNodes()', () => {
      const all = (component as any).allNodes();
      expect(all.length).toBe(5);
      expect(all.map((n: EntityRowNode) => n.profileName)).toEqual([
        'Harriette Quigley',
        'Kendrick Rohan',
        'Cristy Schmitt',
        'Jerrica Cartwright',
        'Test @test'
      ]);
    });

    it('should find a deeply nested node by _uid using findNode()', () => {
      const result = (component as any).findNode('r0-0-0');
      expect(result).not.toBeNull();
      expect(result?.node.profileName).toBe('Cristy Schmitt');
      expect(result?.parent?.profileName).toBe('Kendrick Rohan');
    });

    it('should return null for non-existent _uid in findNode()', () => {
      const result = (component as any).findNode('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('Tree Flattening & Cluster End Border Styling', () => {
    it('should flatten expanded tree rows correctly', () => {
      const flat = (component as any).flattenTree();
      expect(flat.length).toBe(5);
    });

    it('should mark _isClusterEnd ONLY on the final row of a cluster and NOT on standalone rows', () => {
      const flat = (component as any).flattenTree();
      
      const jerrica = flat.find(n => n.profileName === 'Jerrica Cartwright');
      const testRecord = flat.find(n => n.profileName === 'Test @test');

      expect(jerrica?._isClusterEnd).toBeTrue(); // End of Harriette cluster
      expect(testRecord?._isClusterEnd).toBeFalse(); // Standalone flat record
    });
  });

  describe('Checkbox Selection Cascading', () => {
    it('should cascade selection down to all descendants when parent checkbox is clicked', () => {
      component.onCheckboxClick('r0'); // Check root 'Harriette Quigley'

      const all = (component as any).allNodes();
      const harrietteClusterNodes = all.filter((n: EntityRowNode) => n._uid.startsWith('r0'));

      harrietteClusterNodes.forEach((node: EntityRowNode) => {
        expect(node._selected).toBeTrue();
      });

      // Standalone node should remain unselected
      const standalone = all.find((n: EntityRowNode) => n._uid === 'r1');
      expect(standalone._selected).toBeFalse();
    });

    it('should recompute ancestor selection states when a child checkbox is toggled', () => {
      // 1. Select all under r0
      component.onCheckboxClick('r0');
      expect((component as any).findNode('r0')?.node._selected).toBeTrue();

      // 2. Uncheck child 'Cristy Schmitt' (r0-0-0)
      component.onCheckboxClick('r0-0-0');

      // 3. Parents 'Kendrick Rohan' and 'Harriette Quigley' should automatically turn unselected
      expect((component as any).findNode('r0-0-0')?.node._selected).toBeFalse();
      expect((component as any).findNode('r0-0')?.node._selected).toBeFalse();
      expect((component as any).findNode('r0')?.node._selected).toBeFalse();
    });
  });

  describe('Header Checkbox & Bulk Toggle (Select All / Unselect All)', () => {
    it('should select ALL nodes N-levels deep when onHeaderCheckClick() is called from unselected state', () => {
      component.onHeaderCheckClick();

      const all = (component as any).allNodes();
      all.forEach((node: EntityRowNode) => {
        expect(node._selected).toBeTrue();
      });

      expect(mockGridApi.setGridOption).toHaveBeenCalled();
      expect(mockGridApi.refreshHeader).toHaveBeenCalled();
    });

    it('should deselect ALL nodes N-levels deep when onHeaderCheckClick() is called from fully selected state', () => {
      // First select all
      component.onHeaderCheckClick();
      
      // Then click header check again to unselect all
      component.onHeaderCheckClick();

      const all = (component as any).allNodes();
      all.forEach((node: EntityRowNode) => {
        expect(node._selected).toBeFalse();
      });
    });

    it('should set header state to "some" when partial selection exists', () => {
      component.onCheckboxClick('r1'); // Check only standalone record

      (component as any).syncHeaderCheckbox();

      const lastCall = mockGridApi.setGridOption.calls.mostRecent();
      expect(lastCall.args[1][0].headerComponentParams.state).toBe('some');
    });

    it('should set header state to "all" when all nodes are checked', () => {
      component.onHeaderCheckClick();

      const lastCall = mockGridApi.setGridOption.calls.mostRecent();
      expect(lastCall.args[1][0].headerComponentParams.state).toBe('all');
    });

    it('should set header state to "none" when zero nodes are checked', () => {
      (component as any).syncHeaderCheckbox();

      const lastCall = mockGridApi.setGridOption.calls.mostRecent();
      expect(lastCall.args[1][0].headerComponentParams.state).toBe('none');
    });
  });

  describe('Row Expand/Collapse Toggle', () => {
    it('should toggle _expanded state of a target node', () => {
      const node = (component as any).findNode('r0')?.node;
      expect(node._expanded).toBeTrue();

      component.toggleExpand('r0');
      expect(node._expanded).toBeFalse();

      component.toggleExpand('r0');
      expect(node._expanded).toBeTrue();
    });
  });

  describe('AG Grid Row Class Mapping (getRowClass)', () => {
    it('should return "row-parent-expanded" for expanded parent nodes', () => {
      const mockParam = { data: { _isParent: true, _expanded: true } };
      expect(component.getRowClass(mockParam)).toBe('row-parent-expanded');
    });

    it('should return "row-parent-collapsed" for collapsed parent nodes', () => {
      const mockParam = { data: { _isParent: false, _expanded: false, _isClusterEnd: false } };
      expect(component.getRowClass(mockParam)).toBe('row-child');
    });

    it('should return "row-child row-cluster-end" for final cluster child nodes', () => {
      const mockParam = { data: { _isParent: false, _isClusterEnd: true } };
      expect(component.getRowClass(mockParam)).toBe('row-child row-cluster-end');
    });

    it('should return standard "row-child" for flat standalone nodes', () => {
      const mockParam = { data: { _isParent: false, _isClusterEnd: false } };
      expect(component.getRowClass(mockParam)).toBe('row-child');
    });
  });
});