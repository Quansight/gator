import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';
import {
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import {
  CondaEnvironments,
  CondaStoreEnvironments,
  CondaEnvWidget,
  CondaStoreEnvWidget,
  condaIcon,
  CONDA_WIDGET_CLASS,
  IEnvironmentManager
} from '@mamba-org/gator-common';
import { INotification } from 'jupyterlab_toastify';
import { managerTour } from './tour';
import {
  companionID,
  CompanionValidator,
  ICompanionValidator
} from './validator';

const CONDAENVID = '@mamba-org/gator-lab:plugin';
const CONDASTOREENVID = '@condastore/gator-lab:plugin';
const TOUR_DELAY = 1000;
const TOUR_TIMEOUT = 5 * TOUR_DELAY + 1;

async function activateCondaStoreEnv(
  app: JupyterFrontEnd,
  settingsRegistry: ISettingRegistry | null,
  palette: ICommandPalette | null,
  menu: IMainMenu | null,
  restorer: ILayoutRestorer | null
): Promise<IEnvironmentManager> {
  let tour: any;
  const { commands, shell } = app;
  const pluginNamespace = 'conda-store-env';
  const command = 'jupyter_conda_store:open-ui';

  const settings = await settingsRegistry?.load(CONDAENVID);
  const model = new CondaStoreEnvironments(settings);

  // Request listing available package as quickly as possible
  Private.loadPackages(model);

  // Track and restore the widget state
  const tracker = new WidgetTracker<MainAreaWidget<CondaStoreEnvWidget>>({
    namespace: pluginNamespace
  });
  let condaWidget: MainAreaWidget<CondaStoreEnvWidget>;

  commands.addCommand(command, {
    label: 'Conda Store Packages Manager',
    execute: () => {
      app.restored.then(() => {
        let timeout = 0;

        const delayTour = (): void => {
          setTimeout(() => {
            timeout += TOUR_DELAY;
            if (condaWidget?.isVisible && tour) {
              commands.execute('jupyterlab-tour:launch', {
                id: tour.id,
                force: false
              });
            } else if (timeout < TOUR_TIMEOUT) {
              delayTour();
            }
          }, 1000);
        };

        if (commands.hasCommand('jupyterlab-tour:add')) {
          if (!tour) {
            commands
              .execute('jupyterlab-tour:add', {
                tour: managerTour as any
              })
              .then(result => {
                tour = result;
              });
          }

          delayTour();
        }
      });

      if (!condaWidget || condaWidget.isDisposed) {
        condaWidget = new MainAreaWidget({
          content: new CondaStoreEnvWidget(model)
        });
        condaWidget.addClass(CONDA_WIDGET_CLASS);
        condaWidget.id = pluginNamespace;
        condaWidget.title.label = 'Packages';
        condaWidget.title.caption = 'Conda Store Packages Manager';
        condaWidget.title.icon = condaIcon;
      }

      if (!tracker.has(condaWidget)) {
        // Track the state of the widget for later restoration
        tracker.add(condaWidget);
      }
      if (!condaWidget.isAttached) {
        // Attach the widget to the main work area if it's not there
        shell.add(condaWidget, 'main');
      }
      shell.activateById(condaWidget.id);
    }
  });

  // Add command to command palette
  if (palette) {
    palette.addItem({ command, category: 'Settings' });
  }

  // Handle state restoration.
  if (restorer) {
    restorer.restore(tracker, {
      command,
      name: () => pluginNamespace
    });
  }

  // Add command to settings menu
  if (menu) {
    menu.settingsMenu.addGroup([{ command: command }], 999);
  }

  return model;
}

async function activateCondaEnv(
  app: JupyterFrontEnd,
  settingsRegistry: ISettingRegistry | null,
  palette: ICommandPalette | null,
  menu: IMainMenu | null,
  restorer: ILayoutRestorer | null
): Promise<IEnvironmentManager> {
  let tour: any;
  const { commands, shell } = app;
  const pluginNamespace = 'conda-env';
  const command = 'jupyter_conda:open-ui';

  const settings = await settingsRegistry?.load(CONDAENVID);
  const model = new CondaEnvironments(settings);

  // Request listing available package as quickly as possible
  Private.loadPackages(model);

  // Track and restore the widget state
  const tracker = new WidgetTracker<MainAreaWidget<CondaEnvWidget>>({
    namespace: pluginNamespace
  });
  let condaWidget: MainAreaWidget<CondaEnvWidget>;

  commands.addCommand(command, {
    label: 'Conda Packages Manager',
    execute: () => {
      app.restored.then(() => {
        let timeout = 0;

        const delayTour = (): void => {
          setTimeout(() => {
            timeout += TOUR_DELAY;
            if (condaWidget?.isVisible && tour) {
              commands.execute('jupyterlab-tour:launch', {
                id: tour.id,
                force: false
              });
            } else if (timeout < TOUR_TIMEOUT) {
              delayTour();
            }
          }, 1000);
        };

        if (commands.hasCommand('jupyterlab-tour:add')) {
          if (!tour) {
            commands
              .execute('jupyterlab-tour:add', {
                tour: managerTour as any
              })
              .then(result => {
                tour = result;
              });
          }

          delayTour();
        }
      });

      if (!condaWidget || condaWidget.isDisposed) {
        condaWidget = new MainAreaWidget({
          content: new CondaEnvWidget(model)
        });
        condaWidget.addClass(CONDA_WIDGET_CLASS);
        condaWidget.id = pluginNamespace;
        condaWidget.title.label = 'Packages';
        condaWidget.title.caption = 'Conda Packages Manager';
        condaWidget.title.icon = condaIcon;
      }

      if (!tracker.has(condaWidget)) {
        // Track the state of the widget for later restoration
        tracker.add(condaWidget);
      }
      if (!condaWidget.isAttached) {
        // Attach the widget to the main work area if it's not there
        shell.add(condaWidget, 'main');
      }
      shell.activateById(condaWidget.id);
    }
  });

  // Add command to command palette
  if (palette) {
    palette.addItem({ command, category: 'Settings' });
  }

  // Handle state restoration.
  if (restorer) {
    restorer.restore(tracker, {
      command,
      name: () => pluginNamespace
    });
  }

  // Add command to settings menu
  if (menu) {
    menu.settingsMenu.addGroup([{ command: command }], 999);
  }

  return model;
}

async function activateCompanions(
  app: JupyterFrontEnd,
  envManager: IEnvironmentManager,
  settingsRegistry: ISettingRegistry,
  palette: ICommandPalette | null
): Promise<ICompanionValidator> {
  const { commands, serviceManager } = app;
  const command = 'jupyter_conda:companions';
  const settings = await settingsRegistry.load(CONDAENVID);

  const validator = new CompanionValidator(
    serviceManager.kernelspecs,
    envManager,
    settings
  );

  commands.addCommand(command, {
    label: 'Validate kernels compatibility',
    execute: () => {
      validator.validate(serviceManager.kernelspecs.specs);
    }
  });

  // Add command to command palette
  if (palette) {
    palette.addItem({ command, category: 'Troubleshooting' });
  }

  return validator;
}

/**
 * Initialization data for the @mamba-org/gator-lab extension.
 */
const condaManager: JupyterFrontEndPlugin<IEnvironmentManager> = {
  id: CONDAENVID,
  autoStart: true,
  activate: activateCondaEnv,
  optional: [ISettingRegistry, ICommandPalette, IMainMenu, ILayoutRestorer],
  provides: IEnvironmentManager
};

/**
 * Initialization data for the @mamba-org/gator-lab extension.
 */
 const condaStoreManager: JupyterFrontEndPlugin<IEnvironmentManager> = {
  id: CONDASTOREENVID,
  autoStart: true,
  activate: activateCondaStoreEnv,
  optional: [ISettingRegistry, ICommandPalette, IMainMenu, ILayoutRestorer],
  provides: IEnvironmentManager
};

/**
 * Initialization data for the jupyterlab_kernel_companions extension.
 */
const companions: JupyterFrontEndPlugin<ICompanionValidator> = {
  id: companionID,
  autoStart: true,
  activate: activateCompanions,
  requires: [IEnvironmentManager, ISettingRegistry],
  optional: [ICommandPalette],
  provides: ICompanionValidator
};

const extensions = [condaManager, condaStoreManager, companions];

export default extensions;

/* eslint-disable no-inner-declarations */
namespace Private {
  export function loadPackages(model: CondaEnvironments): void {
    let packageFound = false;
    let toastId: React.ReactText;
    const messages = [
      'I know you want to give up, but wait a bit longer...',
      'Why is conda so popular, still loading that gigantic packages list...',
      'Take a break, available packages list are still loading...',
      'Available packages list still loading...'
    ];

    function displayMessage(message: React.ReactNode): void {
      setTimeout(() => {
        if (!packageFound) {
          INotification.update({
            message,
            toastId
          });
          if (messages.length > 0) {
            displayMessage(messages.pop());
          }
        }
      }, 60000);
    }

    model
      .getPackageManager()
      .refreshAvailablePackages(false)
      .then(() => {
        packageFound = true;
        if (toastId) {
          INotification.dismiss(toastId);
        }
      })
      .catch((reason: Error) => {
        console.debug('Fail to cache available packages list.', reason);
        if (toastId) {
          INotification.dismiss(toastId);
        }
      });

    // Tell the user after a minute than the extension if still trying to get
    // the available packages list
    setTimeout(() => {
      if (!packageFound) {
        INotification.inProgress(
          'Loading the available packages list in background...'
        ).then(id => {
          toastId = id;
        });
        displayMessage(messages.pop());
      }
    }, 60000);
  }
}
/* eslint-enable no-inner-declarations */
