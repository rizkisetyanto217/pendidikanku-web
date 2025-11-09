# Dengan icon pada action
  actions={{
    mode: "inline",
    onView: (row) => {
      navigate(`/${schoolId}/sekolah/akademik/detail/${row.id}`, {
        state: { term: row },
      });
    },
    onEdit: (row) => setModal({ mode: "edit", editing: row }),
    onDelete: (row) => {
      setToDelete(row);
      setConfirmOpen(true);
    },
  }}


# Dengan icon hamburger pada icon
    actions={{
        mode: "menu",
        onView: (row) => {
        navigate(`/${schoolId}/sekolah/akademik/detail/${row.id}`, {
            state: { term: row },
        });
        },
        onEdit: (row) => setModal({ mode: "edit", editing: row }),
        onDelete: (row) => {
        setToDelete(row);
        setConfirmOpen(true);
        },
        labels: { view: "Lihat", edit: "Ubah", delete: "Hapus" },
    }}

# Tanpa action 

<CDataTable
  columns={columns}
  rows={rows}
  getRowId={(r) => r.id}
  enableActions={false}
/>