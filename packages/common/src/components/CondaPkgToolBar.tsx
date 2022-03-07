import { faCartArrowDown } from '@fortawesome/free-solid-svg-icons/faCartArrowDown';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons/faSyncAlt';
import { faUndoAlt } from '@fortawesome/free-solid-svg-icons/faUndoAlt';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, HTMLSelect, InputGroup } from '@jupyterlab/ui-components';
import * as React from 'react';
import { classes, style } from 'typestyle/lib';
import { CONDA_PACKAGES_TOOLBAR_CLASS } from '../constants';

export const PACKAGE_TOOLBAR_HEIGHT = 40;

export enum PkgFilters {
  All = 'ALL',
  Installed = 'INSTALLED',
  Available = 'AVAILABLE',
  Updatable = 'UPDATABLE',
  Selected = 'SELECTED'
}

export interface ICondaPkgToolBarProps {
  /**
   * Is the list loading?
   */
  isPending: boolean;
  /**
   * Selected package filter
   */
  category: PkgFilters;
  /**
   * Number of package modifications the user has queued
   */
  selectionCount: number;
  /**
   * Are there some packages updatable?
   */
  hasUpdate: boolean;
  /**
   * Search term in search box
   */
  searchTerm: string;
  /**
   * Filter category change handler
   */
  onCategoryChanged: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  /**
   * Search box handler
   */
  onSearch: (event: React.FormEvent) => void;
  /**
   * Update all packages handler
   */
  onUpdateAll: () => void;
  /**
   * Apply package modifications
   */
  onApply: () => void;
  /**
   * Cancel package modifications
   */
  onCancel: () => void;
  /**
   * Refresh available packages handler
   */
  onRefreshPackages: () => void;
  filterDisabled: boolean;
  searchPlaceholder: string;
  onToggleSelected: () => void;
}

export const CondaPkgToolBar = (props: ICondaPkgToolBarProps): JSX.Element => {
  const hasSelection = props.selectionCount > 0;
  const isShowingSelection = props.category === PkgFilters.Selected;
  return (
    <div className={`lm-Widget ${CONDA_PACKAGES_TOOLBAR_CLASS} jp-Toolbar`}>
      {!props.filterDisabled && (
        <div className="lm-Widget jp-Toolbar-item">
          <HTMLSelect
            value={props.category}
            onChange={props.onCategoryChanged}
            aria-label="Package filter"
          >
            <option value={PkgFilters.All}>All</option>
            <option value={PkgFilters.Installed}>Installed</option>
            <option value={PkgFilters.Available}>Not installed</option>
            <option value={PkgFilters.Updatable}>Updatable</option>
            <option value={PkgFilters.Selected}>Selected</option>
          </HTMLSelect>
        </div>
      )}
      <div className="lm-Widget jp-Toolbar-item">
        <div className={classes('jp-NbConda-search-wrapper', Style.Search)}>
          <InputGroup
            className={Style.SearchInput}
            type="text"
            placeholder={props.searchPlaceholder || 'Search Packages'}
            onChange={props.onSearch}
            value={props.searchTerm}
            rightIcon="search"
          />
        </div>
      </div>
      {props.filterDisabled && (hasSelection || isShowingSelection) && (
        <div className={classes(Style.ShowSelected)}>
          <label>
            <input
              name="package-filter"
              type="radio"
              checked={!props.searchTerm && isShowingSelection}
              onChange={props.onToggleSelected}
            />
            Selected ({props.selectionCount})
          </label>
          <label>
            <input
              name="package-filter"
              type="radio"
              checked={!props.searchTerm && !isShowingSelection}
              onChange={props.onToggleSelected}
            />
            Installed
          </label>
        </div>
      )}
      <div className="lm-Widget jp-Toolbar-spacer jp-Toolbar-item" />
      <Button
        className="jp-ToolbarButtonComponent"
        disabled={!hasSelection}
        minimal
        onMouseDown={props.onApply}
        title="Apply package modifications"
      >
        <FontAwesomeIcon
          icon={faCartArrowDown}
          style={{
            color: hasSelection
              ? 'var(--jp-brand-color0)'
              : 'var(--jp-inverse-layout-color3)'
          }}
        />
      </Button>
      <Button
        className="jp-ToolbarButtonComponent"
        disabled={!hasSelection}
        minimal
        onMouseDown={props.onCancel}
        title="Clear package modifications"
      >
        <FontAwesomeIcon
          icon={faUndoAlt}
          style={{ color: 'var(--jp-inverse-layout-color3)' }}
        />
      </Button>
      <Button
        className="jp-ToolbarButtonComponent"
        disabled={props.isPending}
        minimal
        onMouseDown={props.onRefreshPackages}
        title="Refresh available packages"
      >
        <FontAwesomeIcon
          icon={faSyncAlt}
          spin={props.isPending}
          style={{ color: 'var(--jp-inverse-layout-color3)' }}
        />
      </Button>
    </div>
  );
};

namespace Style {
  export const Toolbar = style({
    alignItems: 'center',
    height: PACKAGE_TOOLBAR_HEIGHT
  });

  export const SearchInput = style({
    lineHeight: 'normal'
  });

  export const Search = style({
    padding: '4px'
  });

  export const ShowSelected = style({
    display: 'flex',
    alignItems: 'center'
  });
}
