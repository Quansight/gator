import { showDialog, Dialog } from '@jupyterlab/apputils';
import { INotification } from 'jupyterlab_toastify';
import * as React from 'react';
import debounce from 'lodash.debounce';
import { style } from 'typestyle';
import { Conda } from '../tokens';
import { CondaPkgList } from './CondaPkgList';
import {
  CondaPkgToolBar,
  PACKAGE_TOOLBAR_HEIGHT,
  PkgFilters
} from './CondaPkgToolBar';
import { PkgGraphWidget } from './PkgGraph';

// Minimal panel width to show package description
const PANEL_SMALL_WIDTH = 500;

/**
 * Package panel property
 */
export interface IPkgPanelProps {
  /**
   * Panel height
   */
  height: number;
  /**
   * Panel width
   */
  width: number;
  /**
   * Package manager for the selected environment
   */
  packageManager: Conda.IPackageManager;
}

/**
 * Package panel state
 */
export interface IPkgPanelState {
  /**
   * Is package list loading?
   */
  isLoading: boolean;
  /**
   * Is the package manager applying changes?
   */
  isApplyingChanges: boolean;
  /**
   * Does package list have description?
   */
  hasDescription: boolean;
  /**
   * Are there some packages updatable?
   */
  hasUpdate: boolean;
  /**
   * Packages list
   */
  packages: Conda.IPackage[];
  /**
   * List of packages that match a search
   */
  searchMatchPackages: Conda.IPackage[];
  /**
   * Selected packages
   */
  selected: Conda.IPackage[];
  /**
   * Active filter
   */
  activeFilter: PkgFilters;
  /**
   * Current search term
   */
  isLoadingVersions: boolean;
  isLoadingSearch: boolean;
  searchTerm: string;
  buildStatus: string;
}

/** Top level React component for widget */
export class CondaPkgPanel extends React.Component<
  IPkgPanelProps,
  IPkgPanelState
> {
  constructor(props: IPkgPanelProps) {
    super(props);
    console.log('CondaPkgPanel constructor()');
    this.state = {
      isLoading: false,
      isApplyingChanges: false,
      hasDescription: false,
      hasUpdate: false,
      packages: [],
      isLoadingVersions: false,
      isLoadingSearch: false,
      searchMatchPackages: [],
      selected: [],
      searchTerm: '',
      activeFilter: PkgFilters.All,
      buildStatus: ''
    };

    this._model = this.props.packageManager;

    this.handleCategoryChanged = this.handleCategoryChanged.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleVersionSelection = this.handleVersionSelection.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleUpdateAll = this.handleUpdateAll.bind(this);
    this.handleApply = this.handleApply.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleRefreshPackages = this.handleRefreshPackages.bind(this);
    this.onPkgBottomHit = this.onPkgBottomHit.bind(this);
  }

  private async _updatePackages(): Promise<void> {
    this.setState({
      isLoading: true,
      hasUpdate: false,
      packages: [],
      selected: []
    });

    try {
      const environmentLoading =
        this._currentEnvironment || this._model.environment;
      // Get installed packages
      const packages = await this._model.refresh(false, environmentLoading);
      this.setState({
        packages: packages,
        hasDescription: this._model.hasDescription(),
        isLoading: false,
        isLoadingVersions: Boolean(this._model.addVersions)
      });

      if (this._model.addVersions) {
        const environment = this._model.environment;
        const packagesWithAllVersions = await this._model.addVersions(packages);
        // if the user has changed the environment, don't apply pending updates
        // that pertain to previous environment
        if (environment === this._model.environment) {
          this.setState({
            packages: packagesWithAllVersions,
            isLoadingVersions: false
          });
        }
      }
    } catch (error) {
      if (error.message !== 'cancelled') {
        this.setState({
          isLoading: false
        });
        console.error(error);
        INotification.error(error.message);
      }
    }
  }

  handleCategoryChanged(event: React.ChangeEvent<HTMLSelectElement>): void {
    if (this.state.isApplyingChanges) {
      return;
    }

    this.setState({
      activeFilter: event.target.value as PkgFilters
    });
  }

  handleClick(pkg: Conda.IPackage): void {
    if (this.state.isApplyingChanges) {
      return;
    }
    const selection: Array<Conda.IPackage> = [...this.state.selected];

    let spliceIndex = this.state.selected.findIndex(
      ({ name }) => name === pkg.name
    );
    if (spliceIndex > -1) {
      selection.splice(spliceIndex, 1);
    } else {
      spliceIndex = 0;
    }

    if (pkg.version_installed) {
      if (pkg.version_installed === pkg.version_selected) {
        if (pkg.updatable) {
          pkg.version_selected = ''; // Set for update
          selection.splice(spliceIndex, 0, pkg);
        } else {
          pkg.version_selected = 'none'; // Set for removal
          selection.splice(spliceIndex, 0, pkg);
        }
      } else {
        if (pkg.version_selected === 'none') {
          pkg.version_selected = pkg.version_installed;
        } else {
          pkg.version_selected = 'none'; // Set for removal
          selection.splice(spliceIndex, 0, pkg);
        }
      }
    } else {
      if (pkg.version_selected !== 'none') {
        pkg.version_selected = 'none'; // Unselect
      } else {
        pkg.version_selected = ''; // Select 'Any'
        selection.splice(spliceIndex, 0, pkg);
      }
    }

    this.setState({
      selected: selection
    });
  }

  handleVersionSelection(pkg: Conda.IPackage, version: string): void {
    if (this.state.isApplyingChanges) {
      return;
    }
    console.log('handleVersionSelection', pkg, version);

    const selection: Array<Conda.IPackage> = [...this.state.selected];

    let spliceIndex = this.state.selected.findIndex(
      ({ name }) => name === pkg.name
    );
    if (spliceIndex > -1) {
      selection.splice(spliceIndex, 1);
    } else {
      spliceIndex = 0;
    }

    if (pkg.version_installed) {
      if (pkg.version_installed !== version) {
        selection.splice(spliceIndex, 0, pkg);
      }
    } else {
      if (version !== 'none') {
        selection.splice(spliceIndex, 0, pkg);
      }
    }

    pkg.version_selected = version;

    this.setState({
      selected: selection
    });
  }

  handleDependenciesGraph = (pkg: Conda.IPackage): void => {
    showDialog({
      title: pkg.name,
      body: new PkgGraphWidget(this._model, pkg.name),
      buttons: [Dialog.okButton()]
    });
  };

  async handleSearch(event: React.FormEvent): Promise<void> {
    if (this.state.isApplyingChanges) {
      return;
    }

    const searchTerm = (event.target as HTMLInputElement).value;
    // need to call setState for searchTerm before waiting for promise
    // to resolve so the UI can update without delay
    this.setState({
      searchTerm,
      isLoadingSearch: true,
      activeFilter: PkgFilters.All
    });

    this.searchOnceUserHasStoppedTyping(searchTerm);
  }
  searchOnceUserHasStoppedTyping = debounce(async (searchTerm: string) => {
    const searchMatchPackages = await this.searchPackages(searchTerm);
    this.setState({ searchMatchPackages, isLoadingSearch: false });
  }, 1000);

  async searchPackages(searchTerm: string): Promise<Conda.IPackage[]> {
    const searchMatchPackages = await this._model.searchPackages(searchTerm);
    return searchMatchPackages;
  }

  async handleUpdateAll(): Promise<void> {
    if (this.state.isApplyingChanges) {
      return;
    }

    let toastId: React.ReactText;
    try {
      this.setState({
        searchTerm: '',
        activeFilter: PkgFilters.Updatable
      });

      const confirmation = await showDialog({
        title: 'Update all',
        body: 'Please confirm you want to update all packages? Conda enforces environment consistency. So maybe only a subset of the available updates will be applied.'
      });

      if (confirmation.button.accept) {
        this.setState({
          isApplyingChanges: true
        });
        toastId = await INotification.inProgress('Updating packages');
        await this._model.update(['--all'], this._currentEnvironment);

        INotification.update({
          toastId: toastId,
          message: 'Package updated successfully.',
          type: 'success',
          autoClose: 5000
        });
      }
    } catch (error) {
      if (error !== 'cancelled') {
        console.error(error);
        if (toastId) {
          INotification.update({
            toastId: toastId,
            message: error.message,
            type: 'error',
            autoClose: 0
          });
        } else {
          INotification.error(error.message);
        }
      } else {
        if (toastId) {
          INotification.dismiss(toastId);
        }
      }
    } finally {
      this.setState({
        isApplyingChanges: false,
        selected: [],
        activeFilter: PkgFilters.All
      });
      this._updatePackages();
    }
  }

  /**
   * Execute requested task in the following order
   * 1. Remove packages
   * 2. Apply updates
   * 3. Install new packages
   */
  async handleApply(): Promise<void> {
    if (this.state.isApplyingChanges) {
      return;
    }

    let toastId: React.ReactText;
    try {
      this.setState({
        searchTerm: '',
        activeFilter: PkgFilters.Selected
      });

      const confirmation = await showDialog({
        title: 'Packages actions',
        body: 'Please confirm you want to apply the selected actions?'
      });

      if (confirmation.button.accept) {
        this.setState({
          isApplyingChanges: true
        });
        toastId = await INotification.inProgress('Starting packages actions');

        // Get modified pkgs
        const toRemove: Array<string> = [];
        const toUpdate: Array<string> = [];
        const toInstall: Array<string> = [];
        this.state.selected.forEach(pkg => {
          if (pkg.version_installed && pkg.version_selected === 'none') {
            toRemove.push(pkg.name);
          } else if (pkg.updatable && pkg.version_selected === '') {
            toUpdate.push(pkg.name);
          } else {
            toInstall.push(
              pkg.version_selected
                ? pkg.name + '=' + pkg.version_selected
                : pkg.name
            );
          }
        });

        // Conda Store does all updates (add, remove, change version) in one call
        if (this._model.changePackages) {
          await INotification.update({
            toastId,
            message: 'Building new environment on server'
          });
          await this._model.changePackages(
            toRemove,
            [...toUpdate, ...toInstall],
            this._currentEnvironment
          );
        } else {
          // Whereas traditional Conda does these updates in stages
          if (toRemove.length > 0) {
            await INotification.update({
              toastId,
              message: 'Removing selected packages'
            });
            await this._model.remove(toRemove, this._currentEnvironment);
          }

          if (toUpdate.length > 0) {
            await INotification.update({
              toastId,
              message: 'Updating selected packages'
            });
            await this._model.update(toUpdate, this._currentEnvironment);
          }

          if (toInstall.length > 0) {
            await INotification.update({
              toastId,
              message: 'Installing new packages'
            });
            await this._model.install(toInstall, this._currentEnvironment);
          }
        }

        INotification.update({
          toastId,
          message: 'Package actions successfully done.',
          type: 'success',
          autoClose: 5000
        });
      }
    } catch (error) {
      if (error !== 'cancelled') {
        console.error(error);
        if (toastId) {
          INotification.update({
            toastId,
            message: error.message,
            type: 'error',
            autoClose: 0
          });
        } else {
          INotification.error(error.message);
        }
      } else {
        if (toastId) {
          INotification.dismiss(toastId);
        }
      }
    } finally {
      this.setState({
        isApplyingChanges: false,
        selected: [],
        activeFilter: PkgFilters.All
      });
      this._updatePackages();
    }
  }

  handleCancel(): void {
    if (this.state.isApplyingChanges) {
      return;
    }

    const { selected, packages } = this.state;

    const selectedInstalledPackages = selected.filter(
      pkg => packages.indexOf(pkg) !== -1
    );
    selectedInstalledPackages.forEach(pkg => {
      pkg.version_selected = pkg.version_installed;
    });

    this.setState({
      selected: [],
      activeFilter: PkgFilters.All
    });
  }

  async handleRefreshPackages(): Promise<void> {
    try {
      await this._model.refreshAvailablePackages();
    } catch (error) {
      if (error.message !== 'cancelled') {
        console.error('Error when refreshing the available packages.', error);
      }
    }
    console.log('calling updatePackages from handleRefreshPackages');
    this._updatePackages();
  }

  componentDidUpdate(prevProps: IPkgPanelProps): void {
    console.log(
      'this._currentEnvironment',
      this._currentEnvironment,
      'this.props.packageManager.environment',
      this.props.packageManager.environment
    );
    if (this._currentEnvironment !== this.props.packageManager.environment) {
      this._currentEnvironment = this.props.packageManager.environment;
      console.log('will now attend to updatePackages from componentDidUpdate');
      this.setState({ activeFilter: PkgFilters.All });
      if (this._currentEnvironment && (this._model as any).getBuildStatus) {
        (this._model as any).getBuildStatus().then((buildStatus: string) => {
          this.setState({ buildStatus });
          if (buildStatus === 'COMPLETED') {
            this._updatePackages();
          }
        });
      } else {
        this._updatePackages();
      }
    }
  }

  /**
   * Callback which is triggered when the bottom of the package list is visible.
   *
   * If the model supports it, more packages will be loaded.
   *
   * @async
   * @return {Promise<void>}
   */
  async onPkgBottomHit(): Promise<void> {
    if (this.state.isLoading) {
      return;
    }

    this.setState({
      isLoading: true
    });
    if (this.state.searchTerm) {
      console.log(
        'onPkgBottomHit, loading search packages, searchTerm',
        this.state.searchTerm
      );
      const searchMatchPackages = await this.searchPackages(
        this.state.searchTerm
      );
      this.setState({ searchMatchPackages });
    } else {
      console.log('onPkgBottomHit, loading installed packages');
      const packages = await this._model.loadInstalledPackages?.();
      if (packages !== undefined) {
        this.setState({ packages });
      }
    }

    this.setState({
      isLoading: false
    });
  }

  combinePackagesSelected(
    packages: Array<Conda.IPackage>,
    selected: Array<Conda.IPackage>
  ): Array<Conda.IPackage> {
    // Update the selected state of each package
    return packages.map(pkg => {
      const selectedPackage = this.state.selected.find(
        ({ name }) => name === pkg.name
      );
      if (selectedPackage) {
        // yes it's a little weird to mutate the pkg, but it's necessary
        // to prevent the multiple arrays that contain these packages to get
        // out of sync
        pkg.version_installed = selectedPackage.version_installed;
        pkg.version_selected = selectedPackage.version_selected;
      } else if (pkg.version_installed) {
        pkg.version_selected = pkg.version_installed;
      }
      return pkg;
    });
  }

  render(): JSX.Element {
    switch (this.state.buildStatus) {
      case 'COMPLETED':
        break;
      case 'FAILED':
        return (
          <Panel>
            <div className={Style.ErrorDiv}>
              The build for this environment failed. Please visit{' '}
              <a
                href={(this._model as any).getCondaStoreWebAppUrl()}
                className={Style.Link}
                target="_blank"
                rel="noreferrer"
              >
                {this._model.environment}
              </a>{' '}
              in the Conda Store web app to rebuild.
            </div>
          </Panel>
        );
      case 'QUEUED':
      case 'BUILDING':
        return (
          <Panel>
            <div className={Style.ErrorDiv}>
              The build for this environment is pending. Come back in a few.
            </div>
          </Panel>
        );
      case '':
        return <Panel />;
      default:
        break;
    }

    // note: search results may be empty
    let packages: Conda.IPackage[];
    let hasMorePackages = false;
    if (!this.state.searchTerm) {
      // empty search box? -> show installed packages
      packages = this.state.packages;
      hasMorePackages = Boolean((this._model as any).hasMoreInstalledPackages);
    } else if (this.state.isLoadingSearch) {
      // clear the page whenever the user starts typing
      packages = [];
    } else {
      // we've fetched the search results, so now show them
      packages = this.state.searchMatchPackages;
      hasMorePackages = Boolean((this._model as any).hasMoreSearchPackages);
    }

    console.log('using package filter', this.state.activeFilter);

    let filteredPkgs = this.combinePackagesSelected(
      packages,
      this.state.selected
    );
    if (this.state.activeFilter === PkgFilters.Installed) {
      filteredPkgs = filteredPkgs.filter(pkg => pkg.version_installed);
    } else if (this.state.activeFilter === PkgFilters.Available) {
      filteredPkgs = filteredPkgs.filter(pkg => !pkg.version_installed);
    } else if (this.state.activeFilter === PkgFilters.Updatable) {
      filteredPkgs = filteredPkgs.filter(pkg => pkg.updatable);
    } else if (this.state.activeFilter === PkgFilters.Selected) {
      filteredPkgs = this.state.selected;
    }

    return (
      <Panel>
        <CondaPkgToolBar
          isPending={this.state.isLoading || this.state.isLoadingSearch}
          category={this.state.activeFilter}
          selectionCount={this.state.selected.length}
          hasUpdate={this.state.hasUpdate}
          searchTerm={this.state.searchTerm}
          onCategoryChanged={this.handleCategoryChanged}
          onSearch={this.handleSearch}
          onUpdateAll={this.handleUpdateAll}
          onApply={this.handleApply}
          onCancel={this.handleCancel}
          onRefreshPackages={this.handleRefreshPackages}
          filterDisabled={Boolean(this._model.loadInstalledPackages)}
          searchPlaceholder={this._model.searchLabel}
          onToggleSelected={(shouldShowSelected: boolean) => {
            this.setState({
              searchTerm: '',
              activeFilter: !shouldShowSelected
                ? PkgFilters.All
                : PkgFilters.Selected
            });
          }}
        />
        <CondaPkgList
          height={this.props.height - PACKAGE_TOOLBAR_HEIGHT}
          hasDescription={
            this.state.hasDescription && this.props.width > PANEL_SMALL_WIDTH
          }
          packages={filteredPkgs}
          hasMorePackages={hasMorePackages}
          isLoadingVersions={this.state.isLoadingVersions}
          onPkgClick={this.handleClick}
          onPkgChange={this.handleVersionSelection}
          onPkgGraph={this.handleDependenciesGraph}
          onPkgBottomHit={this.onPkgBottomHit}
        />
      </Panel>
    );
  }

  private _model: Conda.IPackageManager;
  private _currentEnvironment = '';
}

function Panel({ children }: { children?: React.ReactNode }) {
  return <div className={Style.Panel}>{children}</div>;
}

namespace Style {
  export const Panel = style({
    flexGrow: 1,
    borderLeft: '1px solid var(--jp-border-color2)'
  });

  export const ErrorDiv = style({
    margin: '20px 0 0 20px'
  });

  export const Link = style({
    textDecoration: 'underline',
    color: 'var(--jp-content-link-color)'
  });
}
