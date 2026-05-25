import Dashboard from './components/dashborad';
import Spreadsheet from './components/table';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { setCurrentDocument } from './store/slices/documentSlice';

function App() {
  const dispatch = useAppDispatch();
  const currentDocument = useAppSelector((state) => state.documents.currentDocument);

  if (currentDocument) {
    return (
      <Spreadsheet 
        documentId={currentDocument.id} 
        onBackToDashboard={() => dispatch(setCurrentDocument(null))} 
      />
    );
  }

  return (
    <Dashboard 
      onSelectDocument={(id) => {
      }} 
    />
  );
}

export default App;