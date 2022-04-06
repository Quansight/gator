import React from 'react';
import { style } from 'typestyle';

import help_01auth_01 from '../../style/help/01 - auth/01.png';
import help_01auth_02 from '../../style/help/01 - auth/02.png';
import help_01auth_03 from '../../style/help/01 - auth/03.png';
import help_01auth_04 from '../../style/help/01 - auth/04.png';

import help_02create_env_01 from '../../style/help/02 - create env/01.png';
import help_02create_env_02 from '../../style/help/02 - create env/02.png';
import help_02create_env_03 from '../../style/help/02 - create env/03.png';
import help_02create_env_04 from '../../style/help/02 - create env/04.png';

import help_03install_package_01 from '../../style/help/03 - install package/01.png';
import help_03install_package_02 from '../../style/help/03 - install package/02.png';
import help_03install_package_03 from '../../style/help/03 - install package/03.png';
import help_03install_package_04 from '../../style/help/03 - install package/04.png';
import help_03install_package_05 from '../../style/help/03 - install package/05.png';
import help_03install_package_06 from '../../style/help/03 - install package/06.png';

import help_04remove_package_01 from '../../style/help/04 - remove package/01.png';
import help_04remove_package_02 from '../../style/help/04 - remove package/02.png';
import help_04remove_package_03 from '../../style/help/04 - remove package/03.png';

import help_05remove_env_01 from '../../style/help/05 - remove env/01.png';
import help_05remove_env_02 from '../../style/help/05 - remove env/02.png';

import help_06error_01 from '../../style/help/06 - error/01.png';



interface IHelpPageProps {
  condaStoreBaseUrl: string;
  height: number;
}

export function HelpPage(props: IHelpPageProps): JSX.Element {
  const { condaStoreBaseUrl, height } = props;
  return (
    <Panel height={height}>
      <div
        style={{
          overflow: 'scroll',
          height: '100%',
          padding: '0 20px'
        }}
      >
        <span id="jp-conda-store-help-top" />
        <h2>Conda Store Help</h2>

        <div>
          <h3 id="jp-conda-store-help-section-one">How to authenticate with Gator</h3>
          <details>
            <summary>Click to read more</summary>
            <br />
            
            Conda Store has an authentication mechanism to handle permissions and access to features.<br />
            To work with it, Gator needs to authenticate into Conda Store.<br />
            <br />
            This is what you can expect to see when you are <b>not</b> authenticated :<br />
            <img src={help_01auth_01} alt="app screenshot" width={800} />
            <br /><br />
            Click on the given link, a new tab will open in your browser into Conda Store<br />
            <img src={help_01auth_02} alt="app screenshot" width={800} />
            <br /><br />
            Click on the <b>sign in</b> button and proceed to authentication<br />
            You will be redirected to the <b>user</b> page of Conda Store, as follow : <br />
            <img src={help_01auth_03} alt="app screenshot" width={800} />
            <br /><br />
            Go back to the JupyterLab tab with Gator, and refresh the page.<br />
            You should then be authenticated and see a page similar to this :<br />
            <img src={help_01auth_04} alt="app screenshot" width={800} />
            <br /><br />
            <BackToTop />
          </details>
        </div>

        <div>
          <h3 id="jp-conda-store-help-section-create-env">How to create an environment</h3>
          <details>
            <summary>Click to read more</summary>
            <br />
            
            To create an environment, click on the + button on the left panel<br />
            <img src={help_02create_env_01} alt="app screenshot" width={800} />
            <br /><br />

            Enter the name you want to give to your new environment, and click OK<br />
            <img src={help_02create_env_02} alt="app screenshot" width={800} />
            <br /><br />

            In the bottom right corner of the page, you should see a feedback about the environment building.<br />
            <img src={help_02create_env_03} alt="app screenshot" />
            <br /><br />

            Once created, you should see your new environment in the left panel, <b> prefixed with your username </b><br />
            <img src={help_02create_env_04} alt="app screenshot" width={800} />
            <br /><br />


            <BackToTop />
          </details>
        </div>

        <div>
        <h3 id="jp-conda-store-help-section-install-package">How to add a package to an environment</h3>
          <details>
            <summary>Click to read more</summary>
            <br />

            To add one or several packages, select your environment, click in the main search box and enter the name of the package <br />
            you want to install (In this example : pandas)<br />
            <img src={help_03install_package_01} alt="app screenshot" width={800} />
            <br /><br />
            
            Select the packages you want to install. <br />
            <img src={help_03install_package_02} alt="app screenshot" width={800} />
            <br /><br />
            
            You can chose the exact version of the package you want<br />
            <img src={help_03install_package_03} alt="app screenshot" width={800} />
            <br /><br />
            
            Do the same procedure for all the package you want to install. <br />
            Once done, click on the blue cart on the top right corner <br />
            You are then asked for confirmation of all the changes that will be applied<br />
            <img src={help_03install_package_04} alt="app screenshot" width={800} />
            <br /><br />
            
            In the bottom right corner of the page, you should see a feedback about the environment building.<br />
            <img src={help_03install_package_05} alt="app screenshot"  />
            <br /><br />
            
            If the environment built without error, you will see your changes applied <br />
            <img src={help_03install_package_06} alt="app screenshot" width={800} />
            <br /><br />

            If the build failed, you will see the following feedback. <br />
            <b> Most of the time, an error occures because your changes result in a un unsolvable environment</b><br />
            <img src={help_06error_01} alt="app screenshot" />
            <p>
            To know more about what happened, have a look to the{' '}
            <a
              className={Style.Link}
              href={condaStoreBaseUrl}
              target="_blank"
              rel="noreferrer"
            >
              Conda Store web app.
            </a>
          </p>

            <br /><br /><br />
            

            <BackToTop />
          </details>
        </div>

        <div>
        <h3 id="jp-conda-store-help-section-remove-package">How to remove a package from an environment</h3>
          <details>
            <summary>Click to read more</summary>
            <br />
            
            To remove a package, select the "Remove" option in its corresponding "Change to" column.<br />
            <img src={help_04remove_package_01} alt="app screenshot" width={800} />
            <br /><br />

            Once selected for removal, the package should be selected in red, like this : <br />
            <img src={help_04remove_package_02} alt="app screenshot" width={800} />
            <br /><br />

            Click on the blue cart on the top right corner <br />
            You are then asked for confirmation of all the changes that will be applied<br />
            <img src={help_04remove_package_03} alt="app screenshot" width={800} />
            <br /><br />

            
            <BackToTop />
          </details>
        </div>

        <div>
        <h3 id="jp-conda-store-help-section-remove-env">How to remove an environment</h3>
          <details>
            <summary>Click to read more</summary>
            <br />
            To remove an environment, select it in the left panel, and click on the "X" remove button.<br />
            <img src={help_05remove_env_01} alt="app screenshot" width={800} />
            <br /><br />
            You are then asked for confirmation.<br />
            <img src={help_05remove_env_02} alt="app screenshot" width={800} />
            <br /><br />

            
            <BackToTop />
          </details>
        </div>

        <div>
        <h3 id="jp-conda-store-help-section-troubleshooting">Common errors and troubleshooting</h3>
          <details>
            <summary>Click to read more</summary>
            
            <b> Most of the time, an error occures because your changes result in a un unsolvable environment</b><br />
            <img src={help_06error_01} alt="app screenshot" />
            <br /><br />

            <p>
            To know more about the status of your environment, and have a more advanced control, have a look to the{' '}
            <a
              className={Style.Link}
              href={condaStoreBaseUrl}
              target="_blank"
              rel="noreferrer"
            >
              Conda Store web app.
            </a>
          
            </p>
            <BackToTop />
          </details>
        </div>



      </div>
    </Panel>
  );
}

function Panel({
  height,
  children
}: {
  height: number;
  children?: React.ReactNode;
}) {
  return <div className={Style.Panel(height)}>{children}</div>;
}

namespace Style {
  export const Panel = (height: number): string =>
    style({
      flexGrow: 1,
      borderLeft: '1px solid var(--jp-border-color2)',
      overflow: 'hidden',
      boxSizing: 'border-box',
      paddingBottom: 20,
      height
    });

  const linkStyle = {
    color: 'var(--jp-content-link-color)',
    textDecoration: 'underline'
  };
  export const Link = style({
    ...linkStyle,
    $nest: {
      '&:hover': { ...linkStyle }
    }
  });
}



function BackToTop() {
  return <p>
        <a className={Style.Link} href="#jp-conda-store-help-top">
          Back to top
        </a>
      </p>
}
