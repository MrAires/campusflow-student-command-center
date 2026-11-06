export function seedData(userId, today = new Date()) {
  const dateFromToday = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return d.toISOString().slice(0,10); };
  const rawCourses = [
    {name:'Web Application Frameworks',code:'24CSEN2131',instructor:'Dr. Ananya Rao',color:'#8068f4'},
    {name:'Machine Learning Techniques',code:'24CSEN2311',instructor:'Prof. Vivek Sharma',color:'#32b99c'},
    {name:'Computer Networks',code:'24CSEN2041',instructor:'Dr. R. Menon',color:'#f5a057'},
    {name:'Software Engineering',code:'24CSEN1021',instructor:'Prof. S. Kumar',color:'#5f9ce7'}
  ];
  const taskDefs = [
    [0,'Finish React component assignment','Build reusable React components and document their props.',2,'high','in-progress',120],
    [1,'Review classification algorithms','Revise decision trees, random forests and evaluation metrics.',1,'high','todo',90],
    [2,'Complete network topology lab','Configure VLANs and test connectivity in Packet Tracer.',3,'medium','todo',75],
    [3,'Submit UML diagrams','Prepare use-case, class, and sequence diagrams.',5,'medium','todo',60],
    [0,'Practice REST API integration','Connect a React form with Express and MongoDB.',-2,'medium','done',90],
    [1,'Prepare ML flash cards','Summarize training, validation and overfitting.',-4,'low','done',45],
    [2,'Read routing protocols notes','Review distance vector and link state routing.',-6,'low','done',40]
  ];
  return {rawCourses,taskDefs,dateFromToday,userId};
}
