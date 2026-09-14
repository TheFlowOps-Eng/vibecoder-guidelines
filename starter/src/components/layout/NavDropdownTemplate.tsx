/**
 * Hidden clone source for editor-created dropdowns.
 * Bridge copies classes + data attrs from this — templates own all visuals.
 */
export function NavDropdownTemplate({
  groupClassName,
  linkClassName,
  dropdownClassName,
  childLinkClassName,
  caretClassName = 'navbar__caret',
}: {
  groupClassName: string
  linkClassName: string
  dropdownClassName: string
  childLinkClassName: string
  caretClassName?: string
}) {
  return (
    <div
      hidden
      aria-hidden="true"
      data-ohw-nav-dropdown-template=""
      data-ohw-nav-group=""
      data-ohw-nav-open="click"
      className={groupClassName}
    >
      <a className={linkClassName} href="#" tabIndex={-1}>
        <span className={caretClassName} data-ohw-nav-caret="" />
      </a>
      <div data-ohw-nav-children="" className={dropdownClassName}>
        <a className={childLinkClassName} href="#" tabIndex={-1}>
          <span>Link</span>
        </a>
      </div>
    </div>
  )
}
