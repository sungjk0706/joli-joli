import { Plus, Trash2, FolderPlus, Users } from 'lucide-react'
import { Button, Input, Card, Badge, SectionHeading } from './ui/Common'

const AdminCategories = ({ 
  categories, 
  newCategoryName, 
  setNewCategoryName, 
  onAddCategory, 
  onDeleteCategory 
}) => {
  return (
    <div className="space-y-10 animate-fade-in">
      {/* 카테고리 추가 폼 */}
      <Card className="p-10 border-2 border-brand-pink-light/30">
        <SectionHeading icon={FolderPlus}>새 분류 추가</SectionHeading>
        <form onSubmit={onAddCategory} className="space-y-6">
          <Input 
            label="분류 이름"
            placeholder="예: 상의, 하의, 액세서리..." 
            value={newCategoryName} 
            onChange={e => setNewCategoryName(e.target.value)} 
            required 
          />
          <Button type="submit" variant="secondary" className="w-full py-6 text-xl shadow-xl" icon={Plus}>
            새 분류 추가하기
          </Button>
        </form>
      </Card>

      {/* 카테고리 목록 */}
      <div className="space-y-6">
        <div className="flex justify-between items-end px-2">
          <SectionHeading icon={Users} className="mb-0">등록된 분류 목록</SectionHeading>
          <Badge variant="gray" className="px-3 py-1 font-bold mb-2">총 {categories.length}개</Badge>
        </div>
        
        {categories.length === 0 ? (
          <Card className="text-center py-20 admin-text-secondary italic">
            등록된 분류가 아직 없습니다.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {[...(categories || [])].sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
               <Card key={cat.id} className="flex items-center justify-between p-6 bg-white hover:border-brand-pink-light/50 transition-all group">
                <span className="text-xl admin-title">{cat.name}</span>
                <Button 
                  variant="ghost"
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50"
                  onClick={() => onDeleteCategory(cat.id)}
                  icon={Trash2}
                />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategories
