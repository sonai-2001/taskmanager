import { Grid, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import KanbanCard from "./KanbanCard";

// Define the Task interface
interface Task {
  id: number;
  task_name: string;
  status: string;
  created_at: string;
  end_date: string;
  project_id: number;
}

// Define props for the KanbanColumn component
interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  onDrop: (taskId: number, newStatus: string) => void;
  edit: (task: Task) => void;
  handleDelete: (taskId: number) => void;
}

// React DnD item type constant
const ITEM_TYPE = "TASK";

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  onDrop,
  edit,
  handleDelete
}) => {
  const [{ isOver }, dropRef] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: number }) => onDrop(item.id, status),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <Grid
    component="div"
    item
    xs={12}
    sm={6}
    md={4}
    ref={dropRef}
    sx={{
      backgroundColor: isOver ? "primary.light" : "grey.100",
      borderRadius: 2,
      padding: 2,
      minHeight: "300px",
    }}
  >
    <Typography variant="h6" color="textPrimary" sx={{ marginBottom: 2, textAlign: "center" }}>
      {title}
    </Typography>
    {tasks.length>0?(tasks
      .filter((task) => task.status === status)
      .map((task) => (
        <KanbanCard
          key={task.id}
          task={task}
          edit={edit}
          handleDelete={handleDelete}
        />
      ))):(
        <Typography variant="h5"  sx={{ textAlign: "center" ,color:"black"}}>
          No tasks in this column
        </Typography>
      )}
  </Grid>
  
  
  );
};

export default KanbanColumn;
