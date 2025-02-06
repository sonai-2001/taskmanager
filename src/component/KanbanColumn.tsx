import { Grid, Typography } from "@mui/material";
import { useDrop } from "react-dnd";
import KanbanCard from "./KanbanCard";

interface Task {
  id: number;
  task_name: string;
  status: string;
  created_at: string;
  end_date: string;
  project_id: number;
}

interface KanbanColumnProps {
  title: string;
  status: string;
  tasks: Task[];
  onDrop: (taskId: number, newStatus: string) => void;
  edit: (task: Task) => void;
  handleDelete: (taskId: number) => void;
}

const ITEM_TYPE = "TASK";

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  status,
  tasks,
  onDrop,
  edit,
  handleDelete,
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
      md={3}
      ref={(node) => {
        if (node) dropRef(node);
      }}
      sx={{
        background: isOver
          ? "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)"
          : "linear-gradient(135deg, #ece9e6 0%, #ffffff 100%)",
        borderRadius: 4,
        padding: 3,
        marginRight: 2,
        marginBottom: 2,
        minHeight: "350px",
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
        border: "1px solid #ddd",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      {/* Column Title */}
      <Typography
        variant="h6"
        sx={{
          marginBottom: 2,
          textAlign: "center",
          fontWeight: "bold",
          color: isOver ? "#fff" : "#333",
          textTransform: "uppercase",
          letterSpacing: "0.8px",
        }}
      >
        {title}
      </Typography>

      {/* Task Cards */}
      {tasks.length > 0 ? (
        tasks
          .filter((task) => task.status === status)
          .map((task) => (
            <KanbanCard key={task.id} task={task} edit={edit} handleDelete={handleDelete} />
          ))
      ) : (
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: isOver ? "#fff" : "#777",
            fontStyle: "italic",
          }}
        >
          No tasks in this column
        </Typography>
      )}
    </Grid>
  );
};

export default KanbanColumn;
