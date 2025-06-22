import { SectionGroupItem } from '../../components/SectionGroupItem';
import { CurrentUrlDisplay } from '../../components/CurrentUrlDisplay';
import { NewGroupForm } from '../../components/NewGroupForm';
import { DevelopmentTools } from '../../components/DevelopmentTools';
import { TestScenarios } from '../../utils/testScenarios';
import { useCurrentUrl } from '../../hooks/useCurrentUrl';
import { useSectionGroups } from '../../hooks/useSectionGroups';
import './App.css';

function App() {
  const { currentUrl, loading: urlLoading, error: urlError } = useCurrentUrl();
  const { 
    sectionGroups, 
    loading: groupsLoading, 
    error: groupsError, 
    actions 
  } = useSectionGroups();

  const runTests = async () => {
    await TestScenarios.runAllTests();
    await actions.loadGroups();
  };

  const createTestData = async () => {
    await TestScenarios.createTestData();
    await actions.loadGroups();
  };

  if (urlLoading || groupsLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  if (urlError || groupsError) {
    return (
      <div className="error">
        <p>エラーが発生しました:</p>
        {urlError && <p>{urlError}</p>}
        {groupsError && <p>{groupsError}</p>}
      </div>
    );
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Slack Focus Helper</h1>
      </header>

      <CurrentUrlDisplay url={currentUrl} />

      <div className="section-groups">
        {Object.entries(sectionGroups).map(([groupName, group]) => (
          <SectionGroupItem
            key={groupName}
            groupName={groupName}
            group={group}
            currentUrl={currentUrl}
            onToggle={actions.toggleGroup}
            onDelete={actions.deleteGroup}
            onRename={actions.renameGroup}
            onAddCurrentUrl={(groupName) => actions.addUrlToGroup(groupName, currentUrl)}
            onRemoveUrl={actions.removeUrlFromGroup}
            onUpdateTimeBlocks={actions.updateTimeBlocks}
          />
        ))}
      </div>

      <NewGroupForm onCreateGroup={actions.createGroup} />
      
      <DevelopmentTools 
        onCreateTestData={createTestData}
        onRunTests={runTests}
      />
    </div>
  );
}

export default App;
